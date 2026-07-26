CREATE TYPE "public"."job_visibility" AS ENUM('public', 'private');--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "visibility" "job_visibility" DEFAULT 'public' NOT NULL;