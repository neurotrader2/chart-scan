"use client";

import { useEffect, useState, useCallback } from "react";
import Navigation from "@/components/Navigation";
import StockCard from "@/components/StockCard";
import FilterBar from "@/components/FilterBar";
import ScanButton from "@/components/ScanButton";

interface StockResult {
  ticker: string;
  name: string;
  rSquared: string;
  slope: string;
  annualizedReturn: string;
  compositeScore: string;
  currentPrice: string;
  periodMonths: number;
  marketCap: string;
  exchange: string;
  scanDate: string;
}

interface ApiResponse {
  results: StockResult[];
  total: number;
  page: number;
  limit: number;
  lastScan: string | null;
}

function EmptyState({ hasRun }: { hasRun: boolean }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "80px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
      }}
    >
      <div style={{ fontSize: "48px" }}>📊</div>
      <h2 style={{ fontSize: "20px", fontWeight: 700, color: "hsl(210 40% 98%)", margin: 0 }}>
        {hasRun ? "No stocks match your filters" : "No scan results yet"}
      </h2>
      <p style={{ fontSize: "14px", color: "#64748b", margin: 0, maxWidth: "400px" }}>
        {hasRun
          ? "Try lowering the minimum R² threshold or selecting a different time period."
          : 'Click "Scan Now" to fetch and analyze biotech stocks. The first scan may take a few minutes.'}
      </p>
    </div>
  );
}

export default function Dashboard() {
  const [results, setResults] = useState<StockResult[]>([]);
  const [total, setTotal] = useState(0);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasRunScan, setHasRunScan] = useState(false);

  const [minR2, setMinR2] = useState(0.7);
  const [period, setPeriod] = useState(6);
  const [sortBy, setSortBy] = useState("compositeScore");
  const [page, setPage] = useState(1);
  const limit = 48;

  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        minR2: minR2.toString(),
        period: period.toString(),
        sortBy,
        page: page.toString(),
        limit: limit.toString(),
      });
      const res = await fetch(`/api/stocks?${params}`);
      const data: ApiResponse = await res.json();
      setResults(data.results ?? []);
      setTotal(data.total ?? 0);
      setLastScan(data.lastScan);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [minR2, period, sortBy, page]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  function handleFilterChange<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setPage(1);
    };
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div style={{ minHeight: "100vh" }}>
      <Navigation />

      <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px 24px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "28px",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
              {total > 0
                ? `${total} stocks with R² ≥ ${minR2.toFixed(2)} · ${period === 0 ? "all periods" : `${period}mo trend`}`
                : "Finds stocks on a slow, steady uptrend using linear regression"}
              {lastScan && (
                <span style={{ marginLeft: "12px", color: "#475569" }}>
                  Last scan:{" "}
                  {new Date(lastScan).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </p>
          </div>
          <ScanButton
            onComplete={() => {
              setHasRunScan(true);
              fetchResults();
            }}
          />
        </div>

        {/* Filter bar */}
        <div style={{ marginBottom: "24px" }}>
          <FilterBar
            minR2={minR2}
            period={period}
            sortBy={sortBy}
            onMinR2Change={handleFilterChange(setMinR2)}
            onPeriodChange={handleFilterChange(setPeriod)}
            onSortByChange={handleFilterChange(setSortBy)}
          />
        </div>

        {/* Results grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#64748b" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>⏳</div>
            Loading...
          </div>
        ) : results.length === 0 ? (
          <EmptyState hasRun={hasRunScan || !!lastScan} />
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "16px",
                marginBottom: "32px",
              }}
            >
              {results.map((r, i) => (
                <StockCard
                  key={`${r.ticker}-${r.periodMonths}`}
                  ticker={r.ticker}
                  name={r.name ?? r.ticker}
                  rSquared={parseFloat(r.rSquared)}
                  slope={parseFloat(r.slope)}
                  annualizedReturn={parseFloat(r.annualizedReturn)}
                  compositeScore={parseFloat(r.compositeScore)}
                  currentPrice={parseFloat(r.currentPrice ?? "0")}
                  periodMonths={r.periodMonths}
                  rank={(page - 1) * limit + i + 1}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "8px",
                  alignItems: "center",
                }}
              >
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.03)",
                    color: page === 1 ? "#475569" : "#94a3b8",
                    cursor: page === 1 ? "default" : "pointer",
                    fontSize: "13px",
                  }}
                >
                  ← Prev
                </button>
                <span style={{ fontSize: "13px", color: "#64748b" }}>
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.03)",
                    color: page === totalPages ? "#475569" : "#94a3b8",
                    cursor: page === totalPages ? "default" : "pointer",
                    fontSize: "13px",
                  }}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
