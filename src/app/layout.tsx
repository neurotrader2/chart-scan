import type { Metadata } from "next";
import { cookies } from "next/headers";
import { auth } from "@/lib/firebase-admin";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chart Scan — Biotech Stock Scanner",
  description: "Scan biotech stocks for slow, steady price appreciation using linear regression analysis",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const token = cookieStore.get('__auth_session')?.value;

  try {
    // Only enforce Firebase verification if NOT in development
    if (process.env.NODE_ENV !== 'development') {
      if (!token) throw new Error('No token');
      await auth.verifyIdToken(token);
    }
  } catch (error) {
    // Return unauthorized UI if verification fails
    return (
      <html lang="en" className="dark">
        <body className="antialiased flex items-center justify-center min-h-screen">
          <h1 className="text-xl font-semibold opacity-70">Unauthorized</h1>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta name="robots" content="noindex, nofollow, noimageindex" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        {children}
      </body>
    </html>
  );
}
