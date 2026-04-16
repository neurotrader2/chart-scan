# Mobile Responsiveness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make all pages and components render correctly on mobile by replacing inline style objects with Tailwind responsive utility classes.

**Architecture:** Convert layout/spacing/typography inline styles to Tailwind utilities with `sm:` and `md:` breakpoints. Keep visual styles (colors, gradients, box shadows) as inline. Add a `useBreakpoint` hook for Recharts props which require JavaScript values, not CSS.

**Tech Stack:** Next.js 15 App Router, Tailwind CSS v4, Recharts, TypeScript

---

## File Map

| Action | Path | Purpose |
|--------|------|---------|
| Create | `src/hooks/useBreakpoint.ts` | Client-only hook returning `isMobile: boolean` |
| Modify | `src/components/Navigation.tsx` | Responsive padding, truncate title, 44px touch target |
| Modify | `src/components/FilterBar.tsx` | Responsive gap, touch-friendly button heights |
| Modify | `src/components/MetricsPanel.tsx` | 2-col mobile → 5-col desktop grid |
| Modify | `src/components/RegressionChart.tsx` | Dynamic chart height/YAxis via `useBreakpoint` |
| Modify | `src/components/ScanButton.tsx` | 44px minimum touch target |
| Modify | `src/app/page.tsx` | Responsive grid, stacking header, touch targets |
| Modify | `src/app/stocks/[ticker]/page.tsx` | Responsive header, meta row, period tabs |
| Modify | `src/app/settings/page.tsx` | Responsive padding, shrink-0 badge, text-xs labels |

---

## Task 1: Create `useBreakpoint` hook

**Files:**
- Create: `src/hooks/useBreakpoint.ts`

- [ ] **Step 1: Create the hook file**

```typescript
"use client";

import { useEffect, useState } from "react";

/**
 * Returns true when window.innerWidth < breakpoint (default 640px = Tailwind `sm:`).
 * Safe for Next.js SSR: always starts as false on the server.
 */
export function useBreakpoint(breakpoint = 640): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < breakpoint);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [breakpoint]);

  return isMobile;
}
```

- [ ] **Step 2: Verify the file exists**

Run: `ls src/hooks/`
Expected: `useBreakpoint.ts` listed

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useBreakpoint.ts
git commit -m "feat: add useBreakpoint hook for responsive chart sizing"
```

---

## Task 2: Navigation — responsive padding + touch target

**Files:**
- Modify: `src/components/Navigation.tsx`

- [ ] **Step 1: Replace the file with the Tailwind version**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav
      className="sticky top-0 z-50 border-b border-white/[0.08] backdrop-blur-md"
      style={{ background: "rgba(10, 15, 30, 0.8)", WebkitBackdropFilter: "blur(12px)" }}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-[60px] flex items-center justify-between">
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
              style={{ background: "linear-gradient(135deg, hsl(34 92% 60%), #10b981)", fontSize: "16px" }}
            >
              📈
            </div>
            <span
              className="text-lg font-bold truncate"
              style={{ color: "hsl(34 92% 60%)", letterSpacing: "-0.02em" }}
            >
              Biotech Chart Scanner
            </span>
          </div>
        </Link>

        {/* Nav links */}
        <div className="flex gap-1 shrink-0">
          <Link
            href="/settings"
            title="Settings"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-all duration-150"
            style={{
              color: "hsl(34 92% 60%)",
              background: pathname === "/settings" ? "hsl(34 92% 60% / 0.15)" : "transparent",
              border: pathname === "/settings" ? "1px solid hsl(34 92% 60% / 0.3)" : "1px solid transparent",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </Link>
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Verify in browser**

Run: `npm run dev`
Open Chrome DevTools → Toggle device toolbar → iPhone 12 Pro (390px wide).
Expected: Nav renders without horizontal scroll. Title truncates cleanly if needed. Settings icon has a comfortable tap area.

- [ ] **Step 3: Commit**

```bash
git add src/components/Navigation.tsx
git commit -m "feat(mobile): responsive navigation padding and touch target"
```

---

## Task 3: FilterBar — responsive gap and touch targets

**Files:**
- Modify: `src/components/FilterBar.tsx`

- [ ] **Step 1: Replace the file**

```tsx
"use client";

interface FilterBarProps {
  minR2: number;
  period: number;
  sortBy: string;
  onMinR2Change: (v: number) => void;
  onPeriodChange: (v: number) => void;
  onSortByChange: (v: string) => void;
}

const activeBtn: React.CSSProperties = {
  padding: "6px 14px",
  borderRadius: "8px",
  fontSize: "13px",
  fontWeight: 500,
  border: "1px solid hsl(34 92% 60% / 0.5)",
  cursor: "pointer",
  transition: "all 0.15s ease",
  background: "hsl(34 92% 60% / 0.2)",
  color: "#93c5fd",
  minHeight: "36px",
};

const inactiveBtn: React.CSSProperties = {
  padding: "6px 14px",
  borderRadius: "8px",
  fontSize: "13px",
  fontWeight: 500,
  border: "1px solid rgba(255,255,255,0.08)",
  cursor: "pointer",
  transition: "all 0.15s ease",
  background: "rgba(255,255,255,0.03)",
  color: "#94a3b8",
  minHeight: "36px",
};

export default function FilterBar({
  minR2,
  period,
  sortBy,
  onMinR2Change,
  onPeriodChange,
  onSortByChange,
}: FilterBarProps) {
  const periods = [0, 3, 6, 9, 12];
  const sortOptions = [
    { value: "compositeScore", label: "Score" },
    { value: "rSquared", label: "R²" },
    { value: "slope", label: "Slope" },
  ];

  return (
    <div
      className="flex flex-wrap gap-3 md:gap-5 items-center p-4 md:p-5 rounded-xl border border-white/[0.06]"
      style={{ background: "rgba(255,255,255,0.02)" }}
    >
      {/* R² slider */}
      <div className="flex items-center gap-2.5">
        <label className="text-xs font-medium whitespace-nowrap" style={{ color: "#94a3b8" }}>
          Min R²
        </label>
        <input
          type="range"
          min="0.5"
          max="0.99"
          step="0.01"
          value={minR2}
          onChange={(e) => onMinR2Change(parseFloat(e.target.value))}
          style={{ width: "100px", accentColor: "hsl(34 92% 60%)" }}
        />
        <span className="text-xs font-bold min-w-[36px]" style={{ color: "hsl(210 40% 98%)" }}>
          {minR2.toFixed(2)}
        </span>
      </div>

      {/* Period selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium" style={{ color: "#94a3b8" }}>Period</span>
        <div className="flex gap-1 flex-wrap">
          {periods.map((p) => (
            <button key={p} onClick={() => onPeriodChange(p)} style={period === p ? activeBtn : inactiveBtn}>
              {p === 0 ? "All" : `${p}mo`}
            </button>
          ))}
        </div>
      </div>

      {/* Sort selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium" style={{ color: "#94a3b8" }}>Sort by</span>
        <div className="flex gap-1 flex-wrap">
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSortByChange(opt.value)}
              style={sortBy === opt.value ? activeBtn : inactiveBtn}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify in browser**

iPhone 12 Pro (390px). Expected: filter bar wraps naturally across 2-3 rows without horizontal overflow, buttons are comfortably tappable.

- [ ] **Step 3: Commit**

```bash
git add src/components/FilterBar.tsx
git commit -m "feat(mobile): responsive FilterBar gap and touch-friendly button height"
```

---

## Task 4: MetricsPanel — 2-col mobile grid

**Files:**
- Modify: `src/components/MetricsPanel.tsx`

- [ ] **Step 1: Replace the file**

```tsx
"use client";

interface MetricsPanelProps {
  rSquared: number;
  slope: number;
  annualizedReturn: number;
  compositeScore: number;
  currentPrice: number;
  periodMonths: number;
}

function getR2Color(r2: number): string {
  if (r2 >= 0.9) return "#10b981";
  if (r2 >= 0.8) return "#34d399";
  if (r2 >= 0.7) return "#f59e0b";
  return "#ef4444";
}

function getR2Label(r2: number): string {
  if (r2 >= 0.9) return "Excellent";
  if (r2 >= 0.8) return "Good";
  if (r2 >= 0.7) return "Moderate";
  return "Poor";
}

interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}

function MetricCard({ label, value, sub, color }: MetricCardProps) {
  return (
    <div
      className="p-3 md:p-4 rounded-[10px] border border-white/[0.08]"
      style={{ background: "rgba(255, 255, 255, 0.03)" }}
    >
      <div className="text-[11px] font-medium mb-1.5" style={{ color: "#64748b" }}>
        {label}
      </div>
      <div
        className="text-xl md:text-2xl font-bold leading-tight"
        style={{ color: color ?? "hsl(210 40% 98%)", letterSpacing: "-0.02em" }}
      >
        {value}
      </div>
      {sub && (
        <div className="text-[11px] mt-1" style={{ color: "#64748b" }}>{sub}</div>
      )}
    </div>
  );
}

export default function MetricsPanel({
  rSquared,
  slope,
  annualizedReturn,
  compositeScore,
  currentPrice,
  periodMonths,
}: MetricsPanelProps) {
  const r2Color = getR2Color(rSquared);
  const r2Label = getR2Label(rSquared);
  const returnColor = annualizedReturn >= 0 ? "#10b981" : "#ef4444";
  const returnPrefix = annualizedReturn >= 0 ? "+" : "";

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
      <MetricCard
        label="R² Score"
        value={rSquared.toFixed(3)}
        sub={r2Label}
        color={r2Color}
      />
      <MetricCard
        label="Annualized Return"
        value={`${returnPrefix}${(annualizedReturn * 100).toFixed(1)}%`}
        sub={`${periodMonths}mo period`}
        color={returnColor}
      />
      <MetricCard
        label="Daily Slope"
        value={`$${slope.toFixed(4)}`}
        sub="$/day change"
        color="hsl(34 92% 60%)"
      />
      <MetricCard
        label="Current Price"
        value={`$${currentPrice.toFixed(2)}`}
        sub="Latest close"
      />
      <MetricCard
        label="Composite Score"
        value={(compositeScore * 100).toFixed(1)}
        sub="0–100 ranking"
        color="#a78bfa"
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify in browser**

iPhone 12 Pro (390px) on the stock detail page. Expected: 2 metric cards per row, values readable at `text-xl`, no horizontal overflow.

- [ ] **Step 3: Commit**

```bash
git add src/components/MetricsPanel.tsx
git commit -m "feat(mobile): MetricsPanel responsive 2→3→5 column grid"
```

---

## Task 5: RegressionChart — dynamic height via useBreakpoint

**Files:**
- Modify: `src/components/RegressionChart.tsx`

- [ ] **Step 1: Replace the file**

```tsx
"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useBreakpoint } from "@/hooks/useBreakpoint";

interface ChartDataPoint {
  date: string;
  close: number;
  regressionPrice?: number;
}

interface RegressionChartProps {
  priceData: { date: string; close: number }[];
  regressionLine?: { date: string; regressionPrice: number }[];
  rSquared?: number;
  height?: number;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00Z");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatPrice(value: number): string {
  return `$${value.toFixed(2)}`;
}

interface TooltipPayload {
  value: number;
  name: string;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function makeCustomTooltip(startPrice: number) {
  return function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
    if (!active || !payload?.length) return null;

    const priceEntry = payload.find((p) => p.name === "Price");
    const pct = priceEntry && startPrice > 0
      ? ((priceEntry.value - startPrice) / startPrice) * 100
      : null;
    const pctColor = pct == null ? "#94a3b8" : pct >= 0 ? "#10b981" : "#ef4444";
    const pctPrefix = pct != null && pct >= 0 ? "+" : "";

    return (
      <div
        style={{
          background: "hsl(276 55% 16% / 0.95)",
          border: "1px solid hsl(34 92% 60% / 0.3)",
          borderRadius: "8px",
          padding: "10px 14px",
          fontSize: "13px",
        }}
      >
        <div style={{ color: "#94a3b8", marginBottom: "6px", fontSize: "12px" }}>{label}</div>
        {payload.map((p) => (
          <div key={p.name} style={{ color: p.color, display: "flex", gap: "8px" }}>
            <span style={{ color: "#64748b" }}>{p.name}:</span>
            <span style={{ fontWeight: 600 }}>{formatPrice(p.value)}</span>
          </div>
        ))}
        {pct != null && (
          <div style={{ marginTop: "4px", color: pctColor, fontWeight: 700, fontSize: "14px" }}>
            {pctPrefix}{pct.toFixed(2)}%
          </div>
        )}
      </div>
    );
  };
}

export default function RegressionChart({
  priceData,
  regressionLine,
  rSquared,
  height,
}: RegressionChartProps) {
  const isMobile = useBreakpoint();
  const chartHeight = height ?? (isMobile ? 220 : 350);
  const yAxisWidth = isMobile ? 40 : 60;
  const tickFontSize = isMobile ? 10 : 11;

  const chartData: ChartDataPoint[] = priceData.map((p) => {
    const regPoint = regressionLine?.find((r) => r.date === p.date);
    return {
      date: formatDate(p.date),
      close: p.close,
      regressionPrice: regPoint?.regressionPrice,
    };
  });

  const prices = priceData.map((p) => p.close);
  const minPrice = Math.min(...prices) * 0.97;
  const maxPrice = Math.max(...prices) * 1.03;
  const startPrice = prices[0] ?? 0;
  const CustomTooltip = makeCustomTooltip(startPrice);

  const r2Color =
    !rSquared ? "hsl(34 92% 60%)"
    : rSquared >= 0.9 ? "#10b981"
    : rSquared >= 0.8 ? "#34d399"
    : rSquared >= 0.7 ? "#f59e0b"
    : "#ef4444";

  return (
    <div style={{ width: "100%", height: chartHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(34 92% 60%)" stopOpacity={0.15} />
              <stop offset="95%" stopColor="hsl(34 92% 60%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.05)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fill: "#64748b", fontSize: tickFontSize }}
            tickLine={false}
            axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[minPrice, maxPrice]}
            tickFormatter={(v) => `$${v.toFixed(0)}`}
            tick={{ fill: "#64748b", fontSize: tickFontSize }}
            tickLine={false}
            axisLine={false}
            width={yAxisWidth}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: "12px", color: "#94a3b8" }}
          />
          <Area
            type="monotone"
            dataKey="close"
            name="Price"
            stroke="hsl(34 92% 60%)"
            strokeWidth={1.5}
            fill="url(#priceGradient)"
            dot={false}
            activeDot={{ r: 4, fill: "hsl(34 92% 60%)" }}
          />
          {regressionLine && (
            <Line
              type="linear"
              dataKey="regressionPrice"
              name="Regression"
              stroke={r2Color}
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={false}
              activeDot={false}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 2: Verify in browser**

iPhone 12 Pro (390px) on a stock detail page. Expected: chart renders at 220px height, YAxis is 40px wide (leaving ~310px for chart area), axis labels don't overlap.

- [ ] **Step 3: Commit**

```bash
git add src/components/RegressionChart.tsx
git commit -m "feat(mobile): responsive chart height and axis sizing via useBreakpoint"
```

---

## Task 6: ScanButton — 44px touch target

**Files:**
- Modify: `src/components/ScanButton.tsx`

- [ ] **Step 1: Add `minHeight: "44px"` to the scan button**

In `src/components/ScanButton.tsx`, find the `<button>` element (line 57) and add `minHeight: "44px"` to its style object:

```tsx
<button
  onClick={triggerScan}
  disabled={isScanning}
  style={{
    padding: "10px 20px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 600,
    border: "none",
    cursor: isScanning ? "wait" : "pointer",
    minHeight: "44px",
    background: isScanning
      ? "linear-gradient(135deg, hsl(34 92% 70%), hsl(34 92% 70% / 0.86))"
      : state === "done" ? "linear-gradient(135deg, #10b981, #10b981dd)"
        : state === "error" ? "linear-gradient(135deg, #ef4444, #ef4444dd)"
          : "linear-gradient(135deg, hsl(34 92% 60%), hsl(34 92% 60% / 0.86))",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.2s ease",
    boxShadow: isScanning ? "0 4px 20px hsl(34 92% 70% / 0.4)" : state === "idle" ? "0 4px 20px hsl(34 92% 60% / 0.25)" : "none",
  }}
>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ScanButton.tsx
git commit -m "feat(mobile): 44px minimum touch target on ScanButton"
```

---

## Task 7: Dashboard page — responsive grid and stacking header

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Replace the file**

```tsx
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
```

- [ ] **Step 2: Verify in browser**

iPhone 12 Pro (390px):
- Dashboard header stacks vertically (title on top, ticker+scan below)
- Ticker input takes full available width on mobile
- Stock cards display in 1 column
- Pagination buttons are easy to tap

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat(mobile): responsive dashboard grid, stacking header, touch targets"
```

---

## Task 8: Stock detail page — responsive header and tabs

**Files:**
- Modify: `src/app/stocks/[ticker]/page.tsx`

- [ ] **Step 1: Replace the file**

```tsx
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
                className="min-h-[44px] px-4 rounded-lg text-sm font-medium transition-all duration-150"
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
                height={380}
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
```

- [ ] **Step 2: Verify in browser**

iPhone 12 Pro (390px):
- Ticker heading is `text-2xl` (not 36px → not oversized)
- Exchange / Market Cap / Last scan stack vertically
- Period tabs are at least 44px tall, wrap cleanly if needed
- Chart card title and legend legend stack vertically

- [ ] **Step 3: Commit**

```bash
git add "src/app/stocks/[ticker]/page.tsx"
git commit -m "feat(mobile): responsive stock detail header, meta row, period tabs, chart card"
```

---

## Task 9: Settings page — responsive padding and slider cards

**Files:**
- Modify: `src/app/settings/page.tsx`

- [ ] **Step 1: Replace the file**

```tsx
"use client";

import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";

interface Settings {
  minR2: number;
  minPeriodMonths: number;
  maxPeriodMonths: number;
  minMarketCapM: number;
  minAvgVolumeK: number;
}

const DEFAULT_SETTINGS: Settings = {
  minR2: 0.7,
  minPeriodMonths: 3,
  maxPeriodMonths: 12,
  minMarketCapM: 50,
  minAvgVolumeK: 100,
};

const STORAGE_KEY = "chartscan:settings";

function loadSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function SliderSetting({
  label,
  description,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  description: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="p-4 sm:p-5 border-b border-white/[0.06]">
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm font-semibold" style={{ color: "hsl(210 40% 98%)" }}>{label}</label>
        <span
          className="text-sm font-bold shrink-0"
          style={{
            color: "hsl(34 92% 60%)",
            background: "hsl(34 92% 60% / 0.1)",
            padding: "2px 10px",
            borderRadius: "6px",
          }}
        >
          {format(value)}
        </span>
      </div>
      <p className="text-xs m-0 mb-3" style={{ color: "#64748b" }}>{description}</p>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: "100%", accentColor: "hsl(34 92% 60%)" }}
      />
      <div className="flex justify-between text-xs mt-1" style={{ color: "#475569" }}>
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((s) => ({ ...s, [key]: value }));
    setSaved(false);
  }

  function saveSettings() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function resetDefaults() {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem(STORAGE_KEY);
    setSaved(false);
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      <Navigation />

      <main className="max-w-[720px] mx-auto px-4 py-6 sm:px-6 sm:py-10">
        <div className="mb-8">
          <h1
            className="text-2xl sm:text-3xl font-extrabold m-0 mb-1.5"
            style={{ color: "hsl(210 40% 98%)", letterSpacing: "-0.03em" }}
          >
            Scanner Settings
          </h1>
          <p className="text-sm m-0" style={{ color: "#64748b" }}>
            Customize filters for the biotech stock scan. Settings are saved to your browser.
          </p>
        </div>

        {/* Settings card */}
        <div className="glass-card overflow-hidden mb-6">
          <div
            className="px-4 sm:px-6 py-3.5 border-b border-white/[0.06] text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#475569" }}
          >
            Regression Filters
          </div>

          <SliderSetting
            label="Minimum R² Threshold"
            description="Only show stocks where the price trend fits the regression line at least this well. Higher = more consistent uptrends."
            value={settings.minR2}
            min={0.5}
            max={0.99}
            step={0.01}
            format={(v) => v.toFixed(2)}
            onChange={(v) => update("minR2", v)}
          />

          <SliderSetting
            label="Minimum Period (months)"
            description="The shortest lookback window to analyze."
            value={settings.minPeriodMonths}
            min={1}
            max={settings.maxPeriodMonths}
            step={1}
            format={(v) => `${v}mo`}
            onChange={(v) => update("minPeriodMonths", v)}
          />

          <SliderSetting
            label="Maximum Period (months)"
            description="The longest lookback window to analyze."
            value={settings.maxPeriodMonths}
            min={settings.minPeriodMonths}
            max={24}
            step={1}
            format={(v) => `${v}mo`}
            onChange={(v) => update("maxPeriodMonths", v)}
          />

          <div
            className="px-4 sm:px-6 py-3.5 border-b border-white/[0.06] border-t border-t-white/[0.06] text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#475569" }}
          >
            Stock Filters
          </div>

          <SliderSetting
            label="Minimum Market Cap"
            description="Filter out micro-cap stocks with very low liquidity."
            value={settings.minMarketCapM}
            min={0}
            max={5000}
            step={50}
            format={(v) => (v === 0 ? "None" : v >= 1000 ? `$${v / 1000}B` : `$${v}M`)}
            onChange={(v) => update("minMarketCapM", v)}
          />

          <SliderSetting
            label="Minimum Average Volume"
            description="Filter out thinly traded stocks with low daily volume."
            value={settings.minAvgVolumeK}
            min={0}
            max={5000}
            step={100}
            format={(v) => (v === 0 ? "None" : `${v}K`)}
            onChange={(v) => update("minAvgVolumeK", v)}
          />
        </div>

        {/* Notice */}
        <div
          className="rounded-[10px] p-4 text-sm mb-6"
          style={{
            background: "hsl(34 92% 60% / 0.08)",
            border: "1px solid hsl(34 92% 60% / 0.2)",
            color: "#93c5fd",
          }}
        >
          <strong>Note:</strong> These settings are applied in the dashboard filters. Volume and
          market cap filters are applied during the scan and require re-running the scan to take
          effect.
        </div>

        {/* Actions */}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={saveSettings}
            className="min-h-[44px] px-6 rounded-[10px] text-sm font-semibold text-white border-none cursor-pointer transition-all duration-200"
            style={{
              background: saved
                ? "linear-gradient(135deg, #10b981, #059669)"
                : "linear-gradient(135deg, hsl(34 92% 60%), hsl(34 92% 70%))",
              boxShadow: saved ? "0 4px 20px rgba(16,185,129,0.3)" : "0 4px 20px hsl(34 92% 60% / 0.3)",
            }}
          >
            {saved ? "✓ Saved" : "Save Settings"}
          </button>
          <button
            onClick={resetDefaults}
            className="min-h-[44px] px-6 rounded-[10px] text-sm font-medium cursor-pointer"
            style={{
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.03)",
              color: "#94a3b8",
            }}
          >
            Reset Defaults
          </button>
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Verify in browser**

iPhone 12 Pro (390px) on `/settings`:
- Title is `text-2xl` (not oversized 28px)
- Slider cards have comfortable 16px padding
- Value badge (e.g. "0.70") doesn't wrap — the number stays on one line
- Min/max labels are `text-xs`
- Save/Reset buttons have 44px minimum height

- [ ] **Step 3: Commit**

```bash
git add src/app/settings/page.tsx
git commit -m "feat(mobile): responsive settings page padding, slider cards, touch targets"
```

---

## Self-Review

**Spec coverage check:**
- ✅ Section 1 (Navigation): Task 2 — responsive padding, truncate, 44px touch target
- ✅ Section 2 (Dashboard): Tasks 6, 7 — grid cols, stacking header, ticker width, FilterBar gap, pagination
- ✅ Section 3 (Stock Detail): Tasks 4, 5, 8 — MetricsPanel grid, chart height, header font, meta row, period tabs
- ✅ Section 4 (Settings): Task 9 — container padding, slider padding, shrink-0 badge, text-xs labels

**No placeholders found.** All steps contain complete file contents or targeted diffs.

**Type consistency:** `useBreakpoint` returns `boolean` in Task 1, consumed as `isMobile: boolean` in Task 5. Consistent throughout.
