CREATE TYPE "public"."candidate_status" AS ENUM('new', 'reviewed', 'contacted');--> statement-breakpoint
ALTER TABLE "candidates" ADD COLUMN "slug" varchar(100);--> statement-breakpoint
ALTER TABLE "candidates" ADD COLUMN "role" varchar(255);--> statement-breakpoint
ALTER TABLE "candidates" ADD COLUMN "location" varchar(255);--> statement-breakpoint
ALTER TABLE "candidates" ADD COLUMN "highlights" jsonb;--> statement-breakpoint
ALTER TABLE "candidates" ADD COLUMN "signals" jsonb;--> statement-breakpoint
ALTER TABLE "candidates" ADD COLUMN "frictions" jsonb;--> statement-breakpoint
ALTER TABLE "candidates" ADD COLUMN "agent_note" text;--> statement-breakpoint
ALTER TABLE "candidates" ADD COLUMN "status" "candidate_status" DEFAULT 'new' NOT NULL;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "slug" varchar(100);--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "tagline" varchar(255);--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "industry" varchar(100);--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "location" varchar(255);--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "cultural_highlights" jsonb;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "open_roles" jsonb;--> statement-breakpoint
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_slug_unique" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_slug_unique" UNIQUE("slug");