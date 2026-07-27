CREATE TYPE "public"."match_stage" AS ENUM('self_applied', 'presented_by_admin', 'approved_by_clevy', 'suggested_by_ai', 'pending_cultural_match');--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "stage" "match_stage" DEFAULT 'pending_cultural_match' NOT NULL;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "cv_url" text;--> statement-breakpoint
-- Existing applications were already company-visible; keep them so.
UPDATE "matches" SET "stage" = 'approved_by_clevy';
