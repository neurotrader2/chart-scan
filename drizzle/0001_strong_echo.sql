DROP INDEX "scan_results_ticker_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "scan_results_ticker_period_idx" ON "scan_results" USING btree ("ticker","period_months");