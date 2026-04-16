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
          // Auto-select best available period
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
        <div style={{ textAlign: "center", padding: "100px 24px", color: "#64748b" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>⏳</div>
          Loading {ticker.toUpperCase()}...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ minHeight: "100vh" }}>
        <Navigation />
        <div style={{ textAlign: "center", padding: "100px 24px" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>⚠️</div>
          <h2 style={{ color: "hsl(210 40% 98%)", fontSize: "20px", marginBottom: "8px" }}>
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

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>
        {/* Back button */}
        <button
          onClick={() => router.push("/")}
          style={{
            padding: "6px 12px",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.08)",
            background: "transparent",
            color: "#64748b",
            cursor: "pointer",
            fontSize: "13px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          ← Dashboard
        </button>

        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "12px", flexWrap: "wrap" }}>
            <h1
              style={{
                fontSize: "36px",
                fontWeight: 800,
                color: "hsl(210 40% 98%)",
                margin: 0,
                letterSpacing: "-0.03em",
              }}
            >
              {data.ticker}
            </h1>
            {data.stock && (
              <span style={{ fontSize: "16px", color: "#64748b" }}>{data.stock.name}</span>
            )}
          </div>
          <div
            style={{
              display: "flex",
              gap: "16px",
              marginTop: "8px",
              fontSize: "13px",
              color: "#475569",
            }}
          >
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
        <div style={{ display: "flex", gap: "4px", marginBottom: "20px" }}>
          {availablePeriods.map((p) => {
            const active = activePeriod === p;
            return (
              <button
                key={p}
                onClick={() => setActivePeriod(p)}
                style={{
                  padding: "7px 16px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 500,
                  border: active
                    ? "1px solid hsl(34 92% 60% / 0.5)"
                    : "1px solid rgba(255,255,255,0.08)",
                  background: active ? "hsl(34 92% 60% / 0.2)" : "rgba(255,255,255,0.02)",
                  color: active ? "#93c5fd" : "#94a3b8",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
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
            <div style={{ marginBottom: "24px" }}>
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
            <div
              className="glass-card"
              style={{ padding: "24px", marginBottom: "24px" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <h2
                  style={{
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "#94a3b8",
                    margin: 0,
                  }}
                >
                  Price History — {activePeriod} Month Window
                </h2>
                <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "#475569" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
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
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
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
                height={380}
              />
            </div>

            {/* R² explanation */}
            <div
              className="glass-card"
              style={{ padding: "20px 24px" }}
            >
              <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#94a3b8", margin: "0 0 8px" }}>
                How to interpret these results
              </h3>
              <p style={{ fontSize: "13px", color: "#475569", margin: 0, lineHeight: 1.6 }}>
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
          <div
            className="glass-card"
            style={{ padding: "60px", textAlign: "center", color: "#64748b" }}
          >
            No analysis data available for this period.
          </div>
        )}
      </main>
    </div>
  );
}
