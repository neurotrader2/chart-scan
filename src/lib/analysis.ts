import * as ss from "simple-statistics";
import type { FMPHistoricalPrice } from "./fmp";

export interface RegressionResult {
  slope: number;
  intercept: number;
  rSquared: number;
  annualizedReturn: number;
  compositeScore: number;
  dataPoints: number;
}

export interface StockAnalysis {
  ticker: string;
  currentPrice: number;
  periods: Record<number, RegressionResult>;
  priceHistory: FMPHistoricalPrice[];
}

export interface RankedStock extends StockAnalysis {
  bestPeriod: number;
  bestResult: RegressionResult;
}

/**
 * Run linear regression on a series of closing prices.
 * x-axis: sequential day index (0, 1, 2, ...)
 * y-axis: closing price
 */
export function linearRegression(prices: FMPHistoricalPrice[]): RegressionResult {
  if (prices.length < 10) {
    throw new Error(`Insufficient data: ${prices.length} points (minimum 10)`);
  }

  const points: [number, number][] = prices.map((p, i) => [i, p.close]);

  const regression = ss.linearRegression(points);
  const line = ss.linearRegressionLine(regression);

  // Calculate R²
  const yValues = prices.map((p) => p.close);
  const yMean = ss.mean(yValues);
  const ssTot = yValues.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
  const ssRes = points.reduce((sum, [x, y]) => sum + Math.pow(y - line(x), 2), 0);
  const rSquared = ssTot === 0 ? 1 : Math.max(0, 1 - ssRes / ssTot);

  // Annualized return: slope * 252 trading days / starting price
  const startPrice = prices[0].close;
  const annualizedReturn = startPrice > 0 ? (regression.m * 252) / startPrice : 0;

  // Composite score: weighted combination of R² (consistency) and annualized return (magnitude)
  const compositeScore = calculateCompositeScore(rSquared, annualizedReturn);

  return {
    slope: regression.m,
    intercept: regression.b,
    rSquared,
    annualizedReturn,
    compositeScore,
    dataPoints: prices.length,
  };
}

/**
 * Weighted composite score for ranking.
 * R² is weighted 60% (consistency), annualized return 40% (growth).
 * Penalizes negative returns heavily.
 */
export function calculateCompositeScore(rSquared: number, annualizedReturn: number): number {
  if (annualizedReturn <= 0) return 0;
  // Normalize annualized return — 100% annualized = 1.0 score
  const normalizedReturn = Math.min(annualizedReturn, 2.0) / 2.0;
  return rSquared * 0.6 + normalizedReturn * 0.4;
}

/**
 * Analyze a stock across multiple time periods.
 */
export async function analyzeStock(
  ticker: string,
  priceHistory: FMPHistoricalPrice[],
  periodMonths: number[]
): Promise<StockAnalysis> {
  const sortedPrices = [...priceHistory].sort((a, b) => a.date.localeCompare(b.date));
  const currentPrice = sortedPrices[sortedPrices.length - 1]?.close ?? 0;

  const periods: Record<number, RegressionResult> = {};

  for (const months of periodMonths) {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);
    const cutoffStr = cutoffDate.toISOString().split("T")[0];

    const periodPrices = sortedPrices.filter((p) => p.date >= cutoffStr);

    try {
      periods[months] = linearRegression(periodPrices);
    } catch {
      // Not enough data for this period — skip
    }
  }

  return {
    ticker,
    currentPrice,
    periods,
    priceHistory: sortedPrices,
  };
}

/**
 * Rank stocks by composite score, filtering by minimum R² threshold.
 */
export function rankStocks(
  analyses: StockAnalysis[],
  preferredPeriod: number = 6,
  minR2: number = 0.7
): RankedStock[] {
  const ranked: RankedStock[] = [];

  for (const analysis of analyses) {
    // Find the best period — prefer the specified period, fall back to others
    const periodsToTry = [preferredPeriod, 3, 6, 9, 12].filter(
      (p) => p in analysis.periods
    );

    let bestPeriod = 0;
    let bestResult: RegressionResult | null = null;

    for (const period of periodsToTry) {
      const result = analysis.periods[period];
      if (!result) continue;
      if (result.rSquared < minR2) continue;
      if (result.annualizedReturn <= 0) continue;
      if (!bestResult || result.compositeScore > bestResult.compositeScore) {
        bestPeriod = period;
        bestResult = result;
      }
    }

    if (bestResult) {
      ranked.push({
        ...analysis,
        bestPeriod,
        bestResult,
      });
    }
  }

  return ranked.sort((a, b) => b.bestResult.compositeScore - a.bestResult.compositeScore);
}

/**
 * Generate regression line data points for chart overlay.
 */
export function getRegressionLinePoints(
  prices: FMPHistoricalPrice[],
  result: RegressionResult
): { date: string; regressionPrice: number }[] {
  return prices.map((p, i) => ({
    date: p.date,
    regressionPrice: result.slope * i + result.intercept,
  }));
}
