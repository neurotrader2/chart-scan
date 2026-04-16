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

  // "All" mode: average metrics across all periods per ticker
  if (period === 0) {
    const sortExpr =
      sortBy === "rSquared" ? sql`AVG(${scanResults.rSquared}::numeric)`
      : sortBy === "slope"  ? sql`AVG(${scanResults.slope}::numeric)`
      :                       sql`AVG(${scanResults.compositeScore}::numeric)`;

    const baseWhere = and(
      sql`${scanResults.scanDate} >= (SELECT MAX(scan_date) FROM scan_results) - INTERVAL '1 hour'`,
      sql`${stocks.marketCap} < 10000000000`,
    );

    const [results, countRaw] = await Promise.all([
      db
        .select({
          ticker:           scanResults.ticker,
          rSquared:         sql<string>`AVG(${scanResults.rSquared}::numeric)`,
          slope:            sql<string>`AVG(${scanResults.slope}::numeric)`,
          intercept:        sql<string>`AVG(${scanResults.intercept}::numeric)`,
          annualizedReturn: sql<string>`AVG(${scanResults.annualizedReturn}::numeric)`,
          compositeScore:   sql<string>`AVG(${scanResults.compositeScore}::numeric)`,
          currentPrice:     sql<string>`AVG(${scanResults.currentPrice}::numeric)`,
          scanDate:         sql<string>`MAX(${scanResults.scanDate})`,
          periodMonths:     sql<number>`0`,
          name:             stocks.name,
          marketCap:        stocks.marketCap,
          exchange:         stocks.exchange,
        })
        .from(scanResults)
        .leftJoin(stocks, eq(stocks.ticker, scanResults.ticker))
        .where(baseWhere)
        .groupBy(scanResults.ticker, stocks.name, stocks.marketCap, stocks.exchange)
        .having(sql`AVG(${scanResults.rSquared}::numeric) >= ${minR2}`)
        .orderBy(desc(sortExpr))
        .limit(limit)
        .offset(offset),

      db.execute(
        sql`SELECT COUNT(*) AS count FROM (
          SELECT sr.ticker
          FROM scan_results sr
          LEFT JOIN stocks s ON s.ticker = sr.ticker
          WHERE sr.scan_date >= (SELECT MAX(scan_date) FROM scan_results) - INTERVAL '1 hour'
            AND s.market_cap < 10000000000
          GROUP BY sr.ticker
          HAVING AVG(sr.r_squared::numeric) >= ${minR2}
        ) subq`
      ),
    ]);

    return NextResponse.json({
      results,
      total: Number((countRaw.rows[0] as { count: string }).count ?? 0),
      page,
      limit,
      lastScan: latestDate,
    });
  }

  // Single-period mode
  // Compute the cutoff entirely in SQL to avoid JS Date parsing issues across platforms.
  // This finds all rows within 1 hour of the latest scan date.
  const conditions = [
    gte(scanResults.rSquared, minR2.toString()),
    eq(scanResults.periodMonths, period),
    sql`${scanResults.scanDate} >= (SELECT MAX(scan_date) FROM scan_results) - INTERVAL '1 hour'`,
    sql`${stocks.marketCap} < 10000000000`,
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
      .leftJoin(stocks, eq(stocks.ticker, scanResults.ticker))
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
