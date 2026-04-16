"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import RegressionChart from "@/components/RegressionChart";
import MetricsPanel from "@/components/MetricsPanel";

interface PeriodData {
  rSquared: number;
  slope: number;
  intercept: number;
  annualizedReturn: number;
  compositeScore: number;
  regressionLine: { date: string; regressionPrice: number }[];
  dataPoints: { date: string; close: number }[];
}

interface StockDetail {
  ticker: string;
  stock: {
    name: string;
    marketCap: string;
    exchange: string;
  } | null;
  priceHistory: { date: string; close: number }[];
  periods: Record<string, PeriodData>;
  lastScan: string;
}

const PERIOD_OPTIONS = [3, 6, 9, 12];

export default function StockDetailPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = use(params);
  const router = useRouter();
  const [data, setData] = useState<StockDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePeriod, setActivePeriod] = useState<number>(6);

  useEffect(() => {
    fetch(`/api/stocks/${ticker}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setError(d.error);
        } else {
          setData(d);
          const available = PERIOD_OPTIONS.filter((p) => p.toString() in d.periods);
          if (available.length && !available.includes(activePeriod)) {
            setActivePeriod(available[0]);
          }
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [ticker]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div style={{ minHeight: "100vh" }}>
        <Navigation />
        <div className="text-center py-24 px-6" style={{ color: "#64748b" }}>
          <div className="text-4xl mb-3">⏳</div>
          Loading {ticker.toUpperCase()}...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ minHeight: "100vh" }}>
        <Navigation />
        <div className="text-center py-24 px-6">
          <div className="text-4xl mb-3">⚠️</div>
          <h2 className="text-xl mb-2" style={{ color: "hsl(210 40% 98%)" }}>
            {error ?? "Stock not found"}
          </h2>
          <button
            onClick={() => router.push("/")}
            style={{
              padding: "8px 18px",
              borderRadius: "8px",
              border: "1px solid hsl(34 92% 60% / 0.3)",
              background: "hsl(34 92% 60% / 0.1)",
              color: "#93c5fd",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentPeriod = data.periods[activePeriod.toString()];
  const availablePeriods = PERIOD_OPTIONS.filter((p) => p.toString() in data.periods);
  const currentPrice = data.priceHistory[data.priceHistory.length - 1]?.close ?? 0;

  const formatMarketCap = (val: string) => {
    const n = parseFloat(val);
    if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
    return `$${n}`;
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <Navigation />

      <main className="max-w-[1200px] mx-auto px-4 py-6 sm:px-6 sm:py-8">
        {/* Back button */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1.5 mb-6 text-sm"
          style={{
            padding: "6px 12px",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.08)",
            background: "transparent",
            color: "#64748b",
            cursor: "pointer",
            minHeight: "44px",
          }}
        >
          ← Dashboard
        </button>

        {/* Header */}
        <div className="mb-7">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1
              className="text-2xl sm:text-4xl font-extrabold m-0"
              style={{ color: "hsl(210 40% 98%)", letterSpacing: "-0.03em" }}
            >
              {data.ticker}
            </h1>
            {data.stock && (
              <span className="text-base" style={{ color: "#64748b" }}>{data.stock.name}</span>
            )}
          </div>
          <div className="flex flex-col sm:flex-row sm:gap-4 mt-2 text-xs sm:text-sm gap-1" style={{ color: "#475569" }}>
            {data.stock?.exchange && <span>{data.stock.exchange}</span>}
            {data.stock?.marketCap && (
              <span>Market Cap: {formatMarketCap(data.stock.marketCap)}</span>
            )}
            <span>
              Last scan:{" "}
              {new Date(data.lastScan).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>

        {/* Period tabs */}
        <div className="flex gap-1 flex-wrap mb-5">
          {availablePeriods.map((p) => {
            const active = activePeriod === p;
            return (
              <button
                key={p}
                onClick={() => setActivePeriod(p)}
                className="min-h-[44px] px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-all duration-150"
                style={{
                  border: active
                    ? "1px solid hsl(34 92% 60% / 0.5)"
                    : "1px solid rgba(255,255,255,0.08)",
                  background: active ? "hsl(34 92% 60% / 0.2)" : "rgba(255,255,255,0.02)",
                  color: active ? "#93c5fd" : "#94a3b8",
                  cursor: "pointer",
                }}
              >
                {p} months
              </button>
            );
          })}
        </div>

        {currentPeriod ? (
          <>
            {/* Metrics */}
            <div className="mb-6">
              <MetricsPanel
                rSquared={currentPeriod.rSquared}
                slope={currentPeriod.slope}
                annualizedReturn={currentPeriod.annualizedReturn}
                compositeScore={currentPeriod.compositeScore}
                currentPrice={currentPrice}
                periodMonths={activePeriod}
              />
            </div>

            {/* Chart */}
            <div className="glass-card p-4 sm:p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                <h2 className="text-sm font-semibold m-0" style={{ color: "#94a3b8" }}>
                  Price History — {activePeriod} Month Window
                </h2>
                <div className="flex gap-4 text-xs" style={{ color: "#475569" }}>
                  <span className="flex items-center gap-1.5">
                    <div
                      style={{
                        width: "20px",
                        height: "2px",
                        background: "hsl(34 92% 60%)",
                        borderRadius: "1px",
                      }}
                    />
                    Price
                  </span>
                  <span className="flex items-center gap-1.5">
                    <div
                      style={{
                        width: "20px",
                        height: "2px",
                        background: "#10b981",
                        borderRadius: "1px",
                        borderTop: "2px dashed #10b981",
                      }}
                    />
                    Regression
                  </span>
                </div>
              </div>
              <RegressionChart
                priceData={currentPeriod.dataPoints}
                regressionLine={currentPeriod.regressionLine}
                rSquared={currentPeriod.rSquared}
              />
            </div>

            {/* R² explanation */}
            <div className="glass-card p-5 sm:p-6">
              <h3 className="text-sm font-semibold m-0 mb-2" style={{ color: "#94a3b8" }}>
                How to interpret these results
              </h3>
              <p className="text-xs sm:text-sm m-0 leading-relaxed" style={{ color: "#475569" }}>
                <strong style={{ color: "#64748b" }}>R² (R-squared)</strong> measures how closely
                the price follows a straight line over the period. An R² of{" "}
                <strong style={{ color: "#10b981" }}>0.9+</strong> means the stock is rising very
                consistently — nearly every day is a step up. The{" "}
                <strong style={{ color: "#64748b" }}>dashed regression line</strong> shows the
                theoretical perfect linear trend. <strong style={{ color: "#64748b" }}>Slope</strong>{" "}
                is the daily price change in dollars. This scanner finds stocks where price
                appreciation is <em>slow and steady</em>, not volatile spikes.
              </p>
            </div>
          </>
        ) : (
          <div className="glass-card p-12 text-center" style={{ color: "#64748b" }}>
            No analysis data available for this period.
          </div>
        )}
      </main>
    </div>
  );
}
