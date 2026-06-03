ALTER TABLE "companies" ADD COLUMN "country_code" varchar(2);--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "city" varchar(120);--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "country_code" varchar(2);--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "city" varchar(120);--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "currency" varchar(8) DEFAULT 'USD' NOT NULL;