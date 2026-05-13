ALTER TYPE "public"."role" ADD VALUE 'candidate';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_hash" text NOT NULL;