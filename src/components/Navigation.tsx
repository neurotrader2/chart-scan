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
