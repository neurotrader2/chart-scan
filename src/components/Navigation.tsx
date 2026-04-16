"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Dashboard" },
    { href: "/settings", label: "Settings" },
  ];

  return (
    <nav
      style={{
        background: "rgba(10, 15, 30, 0.8)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "0 24px",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                background: "linear-gradient(135deg, #3b82f6, #10b981)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
              }}
            >
              📈
            </div>
            <span
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#f1f5f9",
                letterSpacing: "-0.02em",
              }}
            >
              Chart<span style={{ color: "#3b82f6" }}>Scan</span>
            </span>
          </div>
        </Link>

        {/* Nav links */}
        <div style={{ display: "flex", gap: "4px" }}>
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 500,
                  textDecoration: "none",
                  color: active ? "#f1f5f9" : "#94a3b8",
                  background: active ? "rgba(59, 130, 246, 0.15)" : "transparent",
                  border: active ? "1px solid rgba(59, 130, 246, 0.3)" : "1px solid transparent",
                  transition: "all 0.15s ease",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
