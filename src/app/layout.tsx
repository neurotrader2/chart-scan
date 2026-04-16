import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chart Scan — Biotech Stock Scanner",
  description: "Scan biotech stocks for slow, steady price appreciation using linear regression analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
