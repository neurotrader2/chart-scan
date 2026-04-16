import { NextResponse } from "next/server";
import { db, stocks, scanResults, dailyPrices } from "@/db";
import { getBiotechStocks, getHistoricalPrices } from "@/lib/fmp";
import * as yahoo from "@/lib/yahoo";
import { analyzeStock, rankStocks } from "@/lib/analysis";
import { checkRateLimit } from "@/lib/redis";
// drizzle-orm operators used via db queries

const PERIODS = [3, 6, 9, 12];

export async function POST() {
  const startTime = Date.now();
  const errors: string[] = [];
  let scanned = 0;
  let saved = 0;

  try {
    // 1. Fetch biotech stock list
    const biotechStocks = await getBiotechStocks();
    if (!biotechStocks.length) {
      return NextResponse.json({ error: "No biotech stocks returned from FMP" }, { status: 502 });
    }

    // 2. Upsert stocks into DB
    for (const stock of biotechStocks) {
      await db
        .insert(stocks)
        .values({
          ticker: stock.symbol,
          name: stock.companyName,
          sector: stock.sector,
          industry: stock.industry,
          marketCap: stock.marketCap?.toString(),
          exchange: stock.exchange,
        })
        .onConflictDoUpdate({
          target: stocks.ticker,
          set: {
            name: stock.companyName,
            marketCap: stock.marketCap?.toString(),
            updatedAt: new Date(),
          },
        });
    }

    // 3. For each stock, fetch prices and run analysis
    const toDate = new Date().toISOString().split("T")[0];
    const fromDate = new Date(Date.now() - 13 * 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0]; // ~13 months of data

    const analyses = [];

    for (const stock of biotechStocks) {
      scanned++;
      try {
        // Rate limit check — fall back to Yahoo if needed
        let prices;
        const allowed = await checkRateLimit();
        if (allowed) {
          prices = await getHistoricalPrices(stock.symbol, fromDate, toDate);
        } else {
          prices = await yahoo.getHistoricalPrices(stock.symbol, fromDate, toDate);
        }

        if (!prices.length) continue;

        // Cache prices in DB
        const priceInserts = prices.map((p) => ({
          ticker: stock.symbol,
          date: p.date,
          open: p.open?.toString(),
          high: p.high?.toString(),
          low: p.low?.toString(),
          close: p.close.toString(),
          volume: p.volume,
        }));

        await db
          .insert(dailyPrices)
          .values(priceInserts)
          .onConflictDoNothing();

        const analysis = await analyzeStock(stock.symbol, prices, PERIODS);
        analyses.push(analysis);
      } catch (err) {
        errors.push(`${stock.symbol}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    // 4. Rank and save results
    const ranked = rankStocks(analyses, 6, 0.5); // Store even moderate results

    for (const stock of ranked) {
      for (const [periodStr, result] of Object.entries(stock.periods)) {
        const period = Number(periodStr);
        await db.insert(scanResults).values({
          ticker: stock.ticker,
          rSquared: result.rSquared.toString(),
          slope: result.slope.toString(),
          intercept: result.intercept.toString(),
          periodMonths: period,
          annualizedReturn: result.annualizedReturn.toString(),
          compositeScore: result.compositeScore.toString(),
          currentPrice: stock.currentPrice.toString(),
        });
        saved++;
      }
    }

    return NextResponse.json({
      success: true,
      scanned,
      saved,
      duration: Date.now() - startTime,
      errors: errors.slice(0, 20), // Return first 20 errors
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Scan failed" },
      { status: 500 }
    );
  }
}
