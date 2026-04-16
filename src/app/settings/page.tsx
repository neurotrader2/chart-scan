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
