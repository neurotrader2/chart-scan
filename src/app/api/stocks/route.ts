import { NextRequest, NextResponse } from "next/server";
import { db, scanResults, stocks } from "@/db";
import { desc, gte, eq, and, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const minR2 = parseFloat(searchParams.get("minR2") ?? "0.7");
  const period = parseInt(searchParams.get("period") ?? "6");
  const sortBy = searchParams.get("sortBy") ?? "compositeScore"; // compositeScore | rSquared | slope
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50")));
  const offset = (page - 1) * limit;

  // Get the most recent scan date
  const latestScan = await db
    .select({ maxDate: sql<string>`max(${scanResults.scanDate})` })
    .from(scanResults);
  const latestDate = latestScan[0]?.maxDate;

  if (!latestDate) {
    return NextResponse.json({
      results: [],
      total: 0,
      page,
      limit,
      lastScan: null,
    });
  }

  // Query results from latest scan
  const cutoff = new Date(latestDate);
  cutoff.setHours(cutoff.getHours() - 1); // Within 1 hour of latest scan

  const conditions = [
    gte(scanResults.rSquared, minR2.toString()),
    eq(scanResults.periodMonths, period),
    gte(scanResults.scanDate, cutoff),
  ];

  // Determine sort column
  const sortColumn =
    sortBy === "rSquared"
      ? scanResults.rSquared
      : sortBy === "slope"
      ? scanResults.slope
      : scanResults.compositeScore;

  const [results, countResult] = await Promise.all([
    db
      .select({
        ticker: scanResults.ticker,
        rSquared: scanResults.rSquared,
        slope: scanResults.slope,
        intercept: scanResults.intercept,
        periodMonths: scanResults.periodMonths,
        annualizedReturn: scanResults.annualizedReturn,
        compositeScore: scanResults.compositeScore,
        currentPrice: scanResults.currentPrice,
        scanDate: scanResults.scanDate,
        name: stocks.name,
        marketCap: stocks.marketCap,
        exchange: stocks.exchange,
      })
      .from(scanResults)
      .leftJoin(stocks, eq(stocks.ticker, scanResults.ticker))
      .where(and(...conditions))
      .orderBy(desc(sortColumn))
      .limit(limit)
      .offset(offset),

    db
      .select({ count: sql<number>`count(*)` })
      .from(scanResults)
      .where(and(...conditions)),
  ]);

  return NextResponse.json({
    results,
    total: Number(countResult[0]?.count ?? 0),
    page,
    limit,
    lastScan: latestDate,
  });
}
