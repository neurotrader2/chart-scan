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
  minHeight: "44px",
  minWidth: "44px",
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
  minHeight: "44px",
  minWidth: "44px",
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
