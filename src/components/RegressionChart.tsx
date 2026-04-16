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
  height = 350,
}: RegressionChartProps) {
  // Merge price data and regression line
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
    <div style={{ width: "100%", height }}>
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
            tick={{ fill: "#64748b", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[minPrice, maxPrice]}
            tickFormatter={(v) => `$${v.toFixed(0)}`}
            tick={{ fill: "#64748b", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={60}
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
