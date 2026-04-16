import type { FMPHistoricalPrice } from "./fmp";

export async function getHistoricalPrices(
  ticker: string,
  from: string,
  to: string
): Promise<FMPHistoricalPrice[]> {
  // yahoo-finance2 is ESM-only with unofficial endpoints — used as fallback only.
  // Using 'any' cast because the package types expose the class constructor
  // but the default export is a pre-instantiated singleton at runtime.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mod = await import("yahoo-finance2") as any;
  const yahooFinance = mod.default ?? mod;

  const result: Array<{
    date: Date;
    open: number | null;
    high: number | null;
    low: number | null;
    close: number;
    volume: number | null;
  }> = await yahooFinance.historical(ticker, {
    period1: new Date(from),
    period2: new Date(to),
    interval: "1d",
  });

  return result
    .map((item) => ({
      date: item.date.toISOString().split("T")[0],
      open: item.open ?? item.close,
      high: item.high ?? item.close,
      low: item.low ?? item.close,
      close: item.close,
      volume: item.volume ?? 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
