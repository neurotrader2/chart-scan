// Shared mock data for all tests

export const MOCK_STOCKS_RESPONSE = {
  results: [
    {
      ticker: "MRNA",
      name: "Moderna Inc.",
      rSquared: "0.923456",
      slope: "0.045678",
      annualizedReturn: "0.182345",
      compositeScore: "0.627891",
      currentPrice: "78.45",
      periodMonths: 6,
      marketCap: "29800000000",
      exchange: "NASDAQ",
      scanDate: new Date().toISOString(),
    },
    {
      ticker: "REGN",
      name: "Regeneron Pharmaceuticals",
      rSquared: "0.891234",
      slope: "0.123456",
      annualizedReturn: "0.243567",
      compositeScore: "0.591234",
      currentPrice: "842.30",
      periodMonths: 6,
      marketCap: "91200000000",
      exchange: "NASDAQ",
      scanDate: new Date().toISOString(),
    },
    {
      ticker: "VRTX",
      name: "Vertex Pharmaceuticals",
      rSquared: "0.856789",
      slope: "0.087654",
      annualizedReturn: "0.156789",
      compositeScore: "0.547234",
      currentPrice: "451.20",
      periodMonths: 6,
      marketCap: "116000000000",
      exchange: "NASDAQ",
      scanDate: new Date().toISOString(),
    },
  ],
  total: 3,
  page: 1,
  limit: 48,
  lastScan: new Date().toISOString(),
};

export const MOCK_EMPTY_RESPONSE = {
  results: [],
  total: 0,
  page: 1,
  limit: 48,
  lastScan: null,
};

const baseDate = new Date();
const priceHistory = Array.from({ length: 180 }, (_, i) => {
  const d = new Date(baseDate);
  d.setDate(d.getDate() - (180 - i));
  return {
    date: d.toISOString().split("T")[0],
    open: 75 + i * 0.02,
    high: 76 + i * 0.02,
    low: 74 + i * 0.02,
    close: 75.5 + i * 0.02,
    volume: 5000000,
  };
});

const regressionLine = priceHistory.map((p, i) => ({
  date: p.date,
  regressionPrice: 70 + i * 0.025,
}));

export const MOCK_STOCK_DETAIL = {
  ticker: "MRNA",
  stock: {
    name: "Moderna Inc.",
    marketCap: "29800000000",
    exchange: "NASDAQ",
  },
  priceHistory,
  periods: {
    "3": {
      rSquared: 0.891,
      slope: 0.041,
      intercept: 70.2,
      annualizedReturn: 0.163,
      compositeScore: 0.589,
      regressionLine: regressionLine.slice(-90),
      dataPoints: priceHistory.slice(-90),
    },
    "6": {
      rSquared: 0.923,
      slope: 0.045,
      intercept: 68.1,
      annualizedReturn: 0.182,
      compositeScore: 0.627,
      regressionLine,
      dataPoints: priceHistory,
    },
    "9": {
      rSquared: 0.878,
      slope: 0.039,
      intercept: 65.3,
      annualizedReturn: 0.155,
      compositeScore: 0.561,
      regressionLine,
      dataPoints: priceHistory,
    },
  },
  lastScan: new Date().toISOString(),
};

export const MOCK_SCAN_RESPONSE = {
  success: true,
  scanned: 487,
  saved: 312,
  duration: 45230,
  errors: [],
};
