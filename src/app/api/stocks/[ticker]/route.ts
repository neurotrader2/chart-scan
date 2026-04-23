import { NextRequest, NextResponse } from "next/server";
import { db, scanResults, stocks, dailyPrices } from "@/db";
import { eq, desc, gte, and } from "drizzle-orm";
import { getRegressionLinePoints } from "@/lib/analysis";
import type { FMPHistoricalPrice } from "@/lib/fmp";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  const upperTicker = ticker.toUpperCase();

  // Fetch stock info
  const stock = await db
    .select()
    .from(stocks)
    .where(eq(stocks.ticker, upperTicker))
    .limit(1);

  // Fetch all scan results for this ticker
  const results = await db
    .select()
    .from(scanResults)
    .where(eq(scanResults.ticker, upperTicker))
    .orderBy(desc(scanResults.scanDate))
    .limit(50);

  if (!results.length) {
    return NextResponse.json(
      { error: `No scan results found for ${upperTicker}` },
      { status: 404 }
    );
  }

  // Get latest results per period
  const latestDate = results[0].scanDate;
  const cutoff = new Date(latestDate);
  cutoff.setHours(cutoff.getHours() - 1);

  const latestResults = results.filter((r) => r.scanDate >= cutoff);

  // Fetch price history (last 13 months)
  const fromDate = new Date(Date.now() - 13 * 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const prices = await db
    .select()
    .from(dailyPrices)
    .where(
      and(
        eq(dailyPrices.ticker, upperTicker),
        gte(dailyPrices.date, fromDate)
      )
    )
    .orderBy(dailyPrices.date);

  // Build chart data with regression lines for each period
  const priceData: FMPHistoricalPrice[] = prices.map((p) => ({
    date: p.date,
    open: parseFloat(p.open ?? "0"),
    high: parseFloat(p.high ?? "0"),
    low: parseFloat(p.low ?? "0"),
    close: parseFloat(p.close),
    volume: p.volume ?? 0,
  }));

  const periodData: Record<
    number,
    {
      rSquared: number;
      slope: number;
      intercept: number;
      annualizedReturn: number;
      compositeScore: number;
      regressionLine: { date: string; regressionPrice: number }[];
      dataPoints: FMPHistoricalPrice[];
    }
  > = {};

  // Process shortest periods first so longer periods with identical data windows are skipped
  const sortedResults = [...latestResults].sort((a, b) => a.periodMonths - b.periodMonths);
  const seenDataPointCounts = new Set<number>();

  for (const result of sortedResults) {
    const months = result.periodMonths;
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);
    const cutoffStr = cutoffDate.toISOString().split("T")[0];

    const periodPrices = priceData.filter((p) => p.date >= cutoffStr);

    // If this period produces the same data window as a shorter period (stock too new),
    // skip it — showing identical charts for multiple tabs is confusing
    if (seenDataPointCounts.has(periodPrices.length)) continue;
    seenDataPointCounts.add(periodPrices.length);

    const regressionResult = {
      slope: parseFloat(result.slope),
      intercept: parseFloat(result.intercept),
      rSquared: parseFloat(result.rSquared),
      annualizedReturn: parseFloat(result.annualizedReturn ?? "0"),
      compositeScore: parseFloat(result.compositeScore ?? "0"),
      dataPoints: periodPrices.length,
    };

    periodData[months] = {
      rSquared: regressionResult.rSquared,
      slope: regressionResult.slope,
      intercept: regressionResult.intercept,
      annualizedReturn: regressionResult.annualizedReturn,
      compositeScore: regressionResult.compositeScore,
      regressionLine: getRegressionLinePoints(periodPrices, regressionResult),
      dataPoints: periodPrices,
    };
  }

  return NextResponse.json({
    ticker: upperTicker,
    stock: stock[0] ?? null,
    priceHistory: priceData,
    periods: periodData,
    lastScan: latestDate,
  });
}
