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
    <div
      style={{
        padding: "20px 24px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "4px",
        }}
      >
        <label style={{ fontSize: "14px", fontWeight: 600, color: "#f1f5f9" }}>{label}</label>
        <span
          style={{
            fontSize: "14px",
            fontWeight: 700,
            color: "#3b82f6",
            background: "rgba(59,130,246,0.1)",
            padding: "2px 10px",
            borderRadius: "6px",
          }}
        >
          {format(value)}
        </span>
      </div>
      <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 12px" }}>{description}</p>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: "100%", accentColor: "#3b82f6" }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "11px",
          color: "#475569",
          marginTop: "4px",
        }}
      >
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

      <main style={{ maxWidth: "720px", margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: "32px" }}>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: 800,
              color: "#f1f5f9",
              margin: "0 0 6px",
              letterSpacing: "-0.03em",
            }}
          >
            Scanner Settings
          </h1>
          <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
            Customize filters for the biotech stock scan. Settings are saved to your browser.
          </p>
        </div>

        {/* Settings card */}
        <div
          className="glass-card"
          style={{ overflow: "hidden", marginBottom: "24px" }}
        >
          <div
            style={{
              padding: "14px 24px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              fontSize: "12px",
              fontWeight: 600,
              color: "#475569",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
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
            style={{
              padding: "14px 24px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              fontSize: "12px",
              fontWeight: 600,
              color: "#475569",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
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
          style={{
            background: "rgba(59,130,246,0.08)",
            border: "1px solid rgba(59,130,246,0.2)",
            borderRadius: "10px",
            padding: "14px 18px",
            fontSize: "13px",
            color: "#93c5fd",
            marginBottom: "24px",
          }}
        >
          <strong>Note:</strong> These settings are applied in the dashboard filters. Volume and
          market cap filters are applied during the scan and require re-running the scan to take
          effect.
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={saveSettings}
            style={{
              padding: "10px 24px",
              borderRadius: "10px",
              border: "none",
              background: saved
                ? "linear-gradient(135deg, #10b981, #059669)"
                : "linear-gradient(135deg, #3b82f6, #2563eb)",
              color: "#fff",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: saved ? "0 4px 20px rgba(16,185,129,0.3)" : "0 4px 20px rgba(59,130,246,0.3)",
            }}
          >
            {saved ? "✓ Saved" : "Save Settings"}
          </button>
          <button
            onClick={resetDefaults}
            style={{
              padding: "10px 24px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.03)",
              color: "#94a3b8",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Reset Defaults
          </button>
        </div>
      </main>
    </div>
  );
}
