// Dedup scan_results: keep only the row with the highest id (most recent) per (ticker, period_months)
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";

// Load .env.local manually
const env = readFileSync(".env.local", "utf8");
for (const line of env.split("\n")) {
    const [key, ...rest] = line.split("=");
    if (key && rest.length) {
        const val = rest.join("=").trim().replace(/^"(.*)"$/, "$1");
        if (!process.env[key.trim()]) process.env[key.trim()] = val;
    }
}

const sql = neon(process.env.DATABASE_URL);

const result = await sql`
  DELETE FROM scan_results
  WHERE id NOT IN (
    SELECT MAX(id)
    FROM scan_results
    GROUP BY ticker, period_months
  )
  RETURNING id
`;

console.log(`✅ Deleted ${result.length} duplicate rows from scan_results.`);
