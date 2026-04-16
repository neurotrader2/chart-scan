import { cacheGet, cacheSet, checkRateLimit } from "./redis";

const FMP_BASE = "https://financialmodelingprep.com/api/v3";

export interface FMPStock {
  symbol: string;
  companyName: string;
  marketCap: number;
  sector: string;
  industry: string;
  exchange: string;
  price: number;
}

export interface FMPHistoricalPrice {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

async function fmpFetch<T>(endpoint: string, cacheKey: string, ttlSeconds: number): Promise<T> {
  // Check cache first
  const cached = await cacheGet<T>(cacheKey);
  if (cached) return cached;

  // Check rate limit
  const allowed = await checkRateLimit();
  if (!allowed) {
    throw new Error("FMP rate limit reached");
  }

  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) throw new Error("FMP_API_KEY environment variable not set");

  const url = `${FMP_BASE}${endpoint}${endpoint.includes("?") ? "&" : "?"}apikey=${apiKey}`;
  const response = await fetch(url, { next: { revalidate: 0 } });

  if (!response.ok) {
    throw new Error(`FMP API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as T;

  // Cache the result
  await cacheSet(cacheKey, data, ttlSeconds);

  return data;
}

export async function getBiotechStocks(): Promise<FMPStock[]> {
  const cacheKey = "fmp:biotech-stocks";
  const ttl = 24 * 60 * 60; // 24 hours

  type ScreenerResult = {
    symbol: string;
    companyName: string;
    marketCap: number;
    sector: string;
    industry: string;
    exchangeShortName: string;
    price: number;
  };

  const results = await fmpFetch<ScreenerResult[]>(
    "/stock-screener?sector=Healthcare&industry=Biotechnology&marketCapLowerThan=10000000000&limit=500",
    cacheKey,
    ttl
  );

  return results.map((r) => ({
    symbol: r.symbol,
    companyName: r.companyName,
    marketCap: r.marketCap,
    sector: r.sector,
    industry: r.industry,
    exchange: r.exchangeShortName,
    price: r.price,
  }));
}

export async function getHistoricalPrices(
  ticker: string,
  from: string,
  to: string
): Promise<FMPHistoricalPrice[]> {
  const cacheKey = `fmp:prices:${ticker}:${from}:${to}`;
  const ttl = 6 * 60 * 60; // 6 hours

  type HistoricalResponse = {
    symbol: string;
    historical: {
      date: string;
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number;
    }[];
  };

  const data = await fmpFetch<HistoricalResponse>(
    `/historical-price-full/${ticker}?from=${from}&to=${to}`,
    cacheKey,
    ttl
  );

  if (!data.historical) return [];

  return data.historical
    .map((p) => ({
      date: p.date,
      open: p.open,
      high: p.high,
      low: p.low,
      close: p.close,
      volume: p.volume,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
