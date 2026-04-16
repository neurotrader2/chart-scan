import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Trigger the scan
  const baseUrl = request.nextUrl.origin;
  const response = await fetch(`${baseUrl}/api/scan`, {
    method: "POST",
  });

  if (!response.ok) {
    const error = await response.text();
    return NextResponse.json({ error: `Scan failed: ${error}` }, { status: 502 });
  }

  const result = await response.json();
  return NextResponse.json({ success: true, ...result });
}
