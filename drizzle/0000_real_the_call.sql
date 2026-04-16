CREATE TABLE "daily_prices" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticker" varchar(10) NOT NULL,
	"date" date NOT NULL,
	"open" numeric(12, 4),
	"high" numeric(12, 4),
	"low" numeric(12, 4),
	"close" numeric(12, 4) NOT NULL,
	"volume" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scan_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticker" varchar(10) NOT NULL,
	"r_squared" numeric(8, 6) NOT NULL,
	"slope" numeric(12, 6) NOT NULL,
	"intercept" numeric(12, 4) NOT NULL,
	"period_months" integer NOT NULL,
	"annualized_return" numeric(8, 4),
	"composite_score" numeric(8, 6),
	"current_price" numeric(12, 4),
	"scan_date" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stocks" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticker" varchar(10) NOT NULL,
	"name" varchar(200) NOT NULL,
	"sector" varchar(100),
	"industry" varchar(100),
	"market_cap" numeric(20, 2),
	"exchange" varchar(20),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "stocks_ticker_unique" UNIQUE("ticker")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "daily_prices_ticker_date_idx" ON "daily_prices" USING btree ("ticker","date");--> statement-breakpoint
CREATE INDEX "daily_prices_ticker_idx" ON "daily_prices" USING btree ("ticker");--> statement-breakpoint
CREATE INDEX "daily_prices_date_idx" ON "daily_prices" USING btree ("date");--> statement-breakpoint
CREATE INDEX "scan_results_ticker_idx" ON "scan_results" USING btree ("ticker");--> statement-breakpoint
CREATE INDEX "scan_results_scan_date_idx" ON "scan_results" USING btree ("scan_date");--> statement-breakpoint
CREATE INDEX "scan_results_r_squared_idx" ON "scan_results" USING btree ("r_squared");--> statement-breakpoint
CREATE INDEX "stocks_ticker_idx" ON "stocks" USING btree ("ticker");