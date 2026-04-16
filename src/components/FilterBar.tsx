"use client";

interface FilterBarProps {
  minR2: number;
  period: number;
  sortBy: string;
  onMinR2Change: (v: number) => void;
  onPeriodChange: (v: number) => void;
  onSortByChange: (v: string) => void;
}

const buttonBase: React.CSSProperties = {
  padding: "6px 14px",
  borderRadius: "8px",
  fontSize: "13px",
  fontWeight: 500,
  border: "1px solid transparent",
  cursor: "pointer",
  transition: "all 0.15s ease",
};

const activeBtn: React.CSSProperties = {
  ...buttonBase,
  background: "hsl(34 92% 60% / 0.2)",
  borderColor: "hsl(34 92% 60% / 0.5)",
  color: "#93c5fd",
};

const inactiveBtn: React.CSSProperties = {
  ...buttonBase,
  background: "rgba(255,255,255,0.03)",
  borderColor: "rgba(255,255,255,0.08)",
  color: "#94a3b8",
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
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "12px",
        padding: "16px 20px",
        display: "flex",
        flexWrap: "wrap",
        gap: "20px",
        alignItems: "center",
      }}
    >
      {/* R² slider */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <label style={{ fontSize: "13px", color: "#94a3b8", fontWeight: 500, whiteSpace: "nowrap" }}>
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
        <span
          style={{
            fontSize: "13px",
            fontWeight: 700,
            color: "hsl(210 40% 98%)",
            minWidth: "36px",
          }}
        >
          {minR2.toFixed(2)}
        </span>
      </div>

      {/* Period selector */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "13px", color: "#94a3b8", fontWeight: 500 }}>Period</span>
        <div style={{ display: "flex", gap: "4px" }}>
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              style={period === p ? activeBtn : inactiveBtn}
            >
              {p === 0 ? "All" : `${p}mo`}
            </button>
          ))}
        </div>
      </div>

      {/* Sort selector */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "13px", color: "#94a3b8", fontWeight: 500 }}>Sort by</span>
        <div style={{ display: "flex", gap: "4px" }}>
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
