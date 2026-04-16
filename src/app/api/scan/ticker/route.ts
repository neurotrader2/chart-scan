import { NextResponse } from "next/server";
import { db, stocks, scanResults, dailyPrices } from "@/db";
import { getHistoricalPrices } from "@/lib/fmp";
import { analyzeStock } from "@/lib/analysis";

const PERIODS = [3, 6, 9, 12];

export async function POST(request: Request) {
  const body = await request.json();
  const ticker = body?.ticker;

  if (!ticker || typeof ticker !== "string") {
    return NextResponse.json({ error: "ticker required" }, { status: 400 });
  }

  const symbol = ticker.trim().toUpperCase();

  const toDate = new Date().toISOString().split("T")[0];
  const fromDate = new Date(Date.now() - 13 * 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  // Fetch price history from FMP
  const prices = await getHistoricalPrices(symbol, fromDate, toDate);
  if (!prices.length) {
    return NextResponse.json({ error: "No price data found for " + symbol }, { status: 404 });
  }

  // Upsert stock row (metadata not available for arbitrary tickers)
  await db
    .insert(stocks)
    .values({ ticker: symbol, name: symbol })
    .onConflictDoUpdate({
      target: stocks.ticker,
      set: { updatedAt: new Date() },
    });

  // Cache prices
  await db
    .insert(dailyPrices)
    .values(
      prices.map((p) => ({
        ticker: symbol,
        date: p.date,
        open: p.open?.toString(),
        high: p.high?.toString(),
        low: p.low?.toString(),
        close: p.close.toString(),
        volume: p.volume,
      }))
    )
    .onConflictDoNothing();

  // Run regression analysis across all periods
  const analysis = await analyzeStock(symbol, prices, PERIODS);

  // Save each period result
  for (const [periodStr, result] of Object.entries(analysis.periods)) {
    const period = Number(periodStr);
    await db
      .insert(scanResults)
      .values({
        ticker: symbol,
        rSquared: result.rSquared.toString(),
        slope: result.slope.toString(),
        intercept: result.intercept.toString(),
        periodMonths: period,
        annualizedReturn: result.annualizedReturn.toString(),
        compositeScore: result.compositeScore.toString(),
        currentPrice: analysis.currentPrice.toString(),
      })
      .onConflictDoUpdate({
        target: [scanResults.ticker, scanResults.periodMonths],
        set: {
          rSquared: result.rSquared.toString(),
          slope: result.slope.toString(),
          intercept: result.intercept.toString(),
          annualizedReturn: result.annualizedReturn.toString(),
          compositeScore: result.compositeScore.toString(),
          currentPrice: analysis.currentPrice.toString(),
          scanDate: new Date(),
        },
      });
  }

  return NextResponse.json({ success: true, ticker: symbol });
}
