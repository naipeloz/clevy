CREATE TYPE "public"."remote_scope" AS ENUM('latam', 'europe', 'usa', 'anywhere');--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "remote_scope" "remote_scope";