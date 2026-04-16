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
      style={{
        background: "rgba(255, 255, 255, 0.03)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "10px",
        padding: "16px 20px",
        flex: 1,
        minWidth: "120px",
      }}
    >
      <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "6px", fontWeight: 500 }}>
        {label}
      </div>
      <div
        style={{
          fontSize: "24px",
          fontWeight: 700,
          color: color ?? "hsl(210 40% 98%)",
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>{sub}</div>
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
    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
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
