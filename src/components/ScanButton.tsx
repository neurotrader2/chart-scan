"use client";

import { useState } from "react";

interface ScanButtonProps {
  onComplete?: () => void;
}

type ScanState = "idle" | "scanning" | "done" | "error";

export default function ScanButton({ onComplete }: ScanButtonProps) {
  const [state, setState] = useState<ScanState>("idle");
  const [progress, setProgress] = useState("");

  async function triggerScan() {
    setState("scanning");
    setProgress("Fetching biotech stock list...");

    try {
      const res = await fetch("/api/scan", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setState("error");
        setProgress(data.error ?? "Scan failed");
        return;
      }

      setState("done");
      setProgress(
        `Scanned ${data.scanned} stocks · Saved ${data.saved} results · ${(data.duration / 1000).toFixed(1)}s`
      );
      onComplete?.();

      setTimeout(() => {
        setState("idle");
        setProgress("");
      }, 5000);
    } catch (err) {
      setState("error");
      setProgress(err instanceof Error ? err.message : "Network error");
      setTimeout(() => {
        setState("idle");
        setProgress("");
      }, 4000);
    }
  }

  const isScanning = state === "scanning";
  const bgColor =
    state === "done" ? "#10b981"
      : state === "error" ? "#ef4444"
        : "hsl(34 92% 60%)";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
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
        {isScanning ? (
          <>
            <ScanSpinner />
            Scanning...
          </>
        ) : state === "done" ? (
          "✓ Done"
        ) : state === "error" ? (
          "✕ Error"
        ) : (
          "⚡ Scan Now"
        )}
      </button>

      {progress && (
        <span
          style={{
            fontSize: "13px",
            color: state === "error" ? "#ef4444" : "#64748b",
            animation: "fade-in 0.3s ease",
          }}
        >
          {progress}
        </span>
      )}
    </div>
  );
}

function ScanSpinner() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      style={{ animation: "spin 1s linear infinite" }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="32"
        strokeDashoffset="10"
      />
    </svg>
  );
}
