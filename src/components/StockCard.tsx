"use client";

import Link from "next/link";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface StockCardProps {
  ticker: string;
  name: string;
  rSquared: number;
  slope: number;
  annualizedReturn: number;
  compositeScore: number;
  currentPrice: number;
  periodMonths: number;
  sparklineData?: number[];
  rank?: number;
}

function getR2Color(r2: number): string {
  if (r2 >= 0.9) return "#10b981";
  if (r2 >= 0.8) return "#34d399";
  if (r2 >= 0.7) return "#f59e0b";
  return "#ef4444";
}

export default function StockCard({
  ticker,
  name,
  rSquared,
  slope: _slope, // eslint-disable-line @typescript-eslint/no-unused-vars
  annualizedReturn,
  compositeScore,
  currentPrice,
  periodMonths,
  sparklineData,
  rank,
}: StockCardProps) {
  const r2Color = getR2Color(rSquared);
  const returnColor = annualizedReturn >= 0 ? "#10b981" : "#ef4444";
  const returnPrefix = annualizedReturn >= 0 ? "+" : "";

  const sparkPoints = sparklineData?.map((v, i) => ({ i, v })) ?? [];

  return (
    <Link href={`/stocks/${ticker}`} style={{ textDecoration: "none" }}>
      <div
        className="glass-card animate-fade-in"
        style={{
          padding: "20px",
          cursor: "pointer",
          transition: "all 0.2s ease",
          position: "relative",
          overflow: "hidden",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
          (e.currentTarget as HTMLDivElement).style.borderColor = "hsl(34 92% 60% / 0.3)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px hsl(34 92% 60% / 0.1)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255, 255, 255, 0.08)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
        }}
      >
        {/* Rank badge */}
        {rank && (
          <div
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              fontSize: "11px",
              color: "#64748b",
              fontWeight: 600,
            }}
          >
            #{rank}
          </div>
        )}

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "14px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              background: "linear-gradient(135deg, hsl(34 92% 60% / 0.2), rgba(16,185,129,0.2))",
              border: `1px solid ${r2Color}40`,
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "13px",
              fontWeight: 700,
              color: r2Color,
              flexShrink: 0,
            }}
          >
            {ticker.slice(0, 2)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "hsl(210 40% 98%)",
                letterSpacing: "0.02em",
              }}
            >
              {ticker}
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#64748b",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {name}
            </div>
          </div>
        </div>

        {/* Sparkline */}
        {sparkPoints.length > 0 && (
          <div style={{ height: "48px", marginBottom: "14px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparkPoints}>
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke={annualizedReturn >= 0 ? "hsl(34 92% 60%)" : "#ef4444"}
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Metrics grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <div>
            <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "2px" }}>R² Score</div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: r2Color }}>
              {rSquared.toFixed(3)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "2px" }}>
              Ann. Return
            </div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: returnColor }}>
              {returnPrefix}{(annualizedReturn * 100).toFixed(1)}%
            </div>
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "2px" }}>Price</div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#94a3b8" }}>
              ${currentPrice.toFixed(2)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "2px" }}>Period</div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#94a3b8" }}>
              {periodMonths}mo
            </div>
          </div>
        </div>

        {/* Score bar */}
        <div style={{ marginTop: "14px" }}>
          <div
            style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}
          >
            <span style={{ fontSize: "11px", color: "#64748b" }}>Composite Score</span>
            <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600 }}>
              {(compositeScore * 100).toFixed(1)}
            </span>
          </div>
          <div
            style={{
              height: "3px",
              background: "rgba(255,255,255,0.08)",
              borderRadius: "2px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${Math.min(100, compositeScore * 100)}%`,
                background: `linear-gradient(90deg, hsl(34 92% 60%), ${r2Color})`,
                borderRadius: "2px",
                transition: "width 0.5s ease",
              }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
