ALTER TABLE "jobs" ADD COLUMN "hard_skills" jsonb;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "experience_min" integer;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "industry" varchar(120);