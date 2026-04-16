import { pgTable, serial, varchar, numeric, integer, date, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";

export const stocks = pgTable("stocks", {
  id: serial("id").primaryKey(),
  ticker: varchar("ticker", { length: 10 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  sector: varchar("sector", { length: 100 }),
  industry: varchar("industry", { length: 100 }),
  marketCap: numeric("market_cap", { precision: 20, scale: 2 }),
  exchange: varchar("exchange", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("stocks_ticker_idx").on(table.ticker),
]);

export const scanResults = pgTable("scan_results", {
  id: serial("id").primaryKey(),
  ticker: varchar("ticker", { length: 10 }).notNull(),
  rSquared: numeric("r_squared", { precision: 8, scale: 6 }).notNull(),
  slope: numeric("slope", { precision: 12, scale: 6 }).notNull(),
  intercept: numeric("intercept", { precision: 12, scale: 4 }).notNull(),
  periodMonths: integer("period_months").notNull(),
  annualizedReturn: numeric("annualized_return", { precision: 8, scale: 4 }),
  compositeScore: numeric("composite_score", { precision: 8, scale: 6 }),
  currentPrice: numeric("current_price", { precision: 12, scale: 4 }),
  scanDate: timestamp("scan_date").defaultNow().notNull(),
}, (table) => [
  index("scan_results_ticker_idx").on(table.ticker),
  index("scan_results_scan_date_idx").on(table.scanDate),
  index("scan_results_r_squared_idx").on(table.rSquared),
]);

export const dailyPrices = pgTable("daily_prices", {
  id: serial("id").primaryKey(),
  ticker: varchar("ticker", { length: 10 }).notNull(),
  date: date("date").notNull(),
  open: numeric("open", { precision: 12, scale: 4 }),
  high: numeric("high", { precision: 12, scale: 4 }),
  low: numeric("low", { precision: 12, scale: 4 }),
  close: numeric("close", { precision: 12, scale: 4 }).notNull(),
  volume: integer("volume"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("daily_prices_ticker_date_idx").on(table.ticker, table.date),
  index("daily_prices_ticker_idx").on(table.ticker),
  index("daily_prices_date_idx").on(table.date),
]);

export type Stock = typeof stocks.$inferSelect;
export type NewStock = typeof stocks.$inferInsert;
export type ScanResult = typeof scanResults.$inferSelect;
export type NewScanResult = typeof scanResults.$inferInsert;
export type DailyPrice = typeof dailyPrices.$inferSelect;
export type NewDailyPrice = typeof dailyPrices.$inferInsert;
