"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
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
    <div className="text-center py-16 px-6 flex flex-col items-center gap-4">
      <div style={{ fontSize: "48px" }}>📊</div>
      <h2 className="text-xl font-bold m-0" style={{ color: "hsl(210 40% 98%)" }}>
        {hasRun ? "No stocks match your filters" : "No scan results yet"}
      </h2>
      <p className="text-sm m-0 max-w-[400px]" style={{ color: "#64748b" }}>
        {hasRun
          ? "Try lowering the minimum R² threshold or selecting a different time period."
          : 'Click "Scan Now" to fetch and analyze biotech stocks. The first scan may take a few minutes.'}
      </p>
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [results, setResults] = useState<StockResult[]>([]);
  const [total, setTotal] = useState(0);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasRunScan, setHasRunScan] = useState(false);

  const [tickerInput, setTickerInput] = useState("");
  const [tickerLoading, setTickerLoading] = useState(false);
  const [tickerError, setTickerError] = useState("");

  async function handleTickerLookup() {
    const symbol = tickerInput.trim().toUpperCase();
    if (!symbol) return;
    setTickerLoading(true);
    setTickerError("");
    try {
      const res = await fetch("/api/scan/ticker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker: symbol }),
      });
      const data = await res.json();
      if (!res.ok) {
        setTickerError(data.error ?? "Lookup failed");
        setTimeout(() => setTickerError(""), 4000);
        return;
      }
      router.push(`/stocks/${symbol}`);
    } catch {
      setTickerError("Network error");
      setTimeout(() => setTickerError(""), 4000);
    } finally {
      setTickerLoading(false);
    }
  }

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

      <main className="max-w-[1400px] mx-auto px-4 py-6 sm:px-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start mb-7">
          <div>
            <p className="text-sm m-0" style={{ color: "#64748b" }}>
              {total > 0
                ? `${total} stocks with R² ≥ ${minR2.toFixed(2)} · ${period === 0 ? "all periods" : `${period}mo trend`}`
                : "Finds stocks on a slow, steady uptrend using linear regression"}
              {lastScan && (
                <span className="ml-3" style={{ color: "#475569" }}>
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
          <div className="flex items-center gap-2 flex-wrap">
            {/* Ticker lookup */}
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                placeholder="Ticker…"
                value={tickerInput}
                disabled={tickerLoading}
                onChange={(e) => setTickerInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleTickerLookup()}
                className="flex-1 sm:w-[100px]"
                style={{
                  padding: "9px 12px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.05)",
                  color: "hsl(210 40% 98%)",
                  fontSize: "13px",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  outline: "none",
                  minHeight: "44px",
                }}
              />
              <button
                onClick={handleTickerLookup}
                disabled={tickerLoading || !tickerInput.trim()}
                style={{
                  padding: "9px 14px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: 600,
                  border: "none",
                  cursor: tickerLoading || !tickerInput.trim() ? "default" : "pointer",
                  background: "rgba(255,255,255,0.08)",
                  color: tickerLoading || !tickerInput.trim() ? "#475569" : "#94a3b8",
                  transition: "all 0.15s ease",
                  minHeight: "44px",
                }}
              >
                {tickerLoading ? "…" : "Go"}
              </button>
              {tickerError && (
                <span className="text-xs" style={{ color: "#ef4444" }}>{tickerError}</span>
              )}
            </div>

            <ScanButton
              onComplete={() => {
                setHasRunScan(true);
                fetchResults();
              }}
            />
          </div>
        </div>

        {/* Filter bar */}
        <div className="mb-6">
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
          <div className="text-center py-12 px-6" style={{ color: "#64748b" }}>
            <div className="text-3xl mb-3">⏳</div>
            Loading...
          </div>
        ) : results.length === 0 ? (
          <EmptyState hasRun={hasRunScan || !!lastScan} />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
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
              <div className="flex justify-center gap-2 items-center">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2.5 rounded-lg border text-sm"
                  style={{
                    borderColor: "rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.03)",
                    color: page === 1 ? "#475569" : "#94a3b8",
                    cursor: page === 1 ? "default" : "pointer",
                  }}
                >
                  ← Prev
                </button>
                <span className="text-sm" style={{ color: "#64748b" }}>
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2.5 rounded-lg border text-sm"
                  style={{
                    borderColor: "rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.03)",
                    color: page === totalPages ? "#475569" : "#94a3b8",
                    cursor: page === totalPages ? "default" : "pointer",
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
