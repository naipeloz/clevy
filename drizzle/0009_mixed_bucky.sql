-- Collapse roles to root / admin / user.
--   admin (super)   -> root
--   hiring_manager  -> admin  (company admin)
--   recruiter       -> admin  (removed role folds into company admin)
--   candidate       -> user
ALTER TABLE "invitations" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "invitations" ALTER COLUMN "role" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;--> statement-breakpoint
UPDATE "users" SET "role" = CASE "role"
  WHEN 'admin' THEN 'root'
  WHEN 'hiring_manager' THEN 'admin'
  WHEN 'recruiter' THEN 'admin'
  WHEN 'candidate' THEN 'user'
  ELSE 'user' END;--> statement-breakpoint
UPDATE "invitations" SET "role" = CASE "role"
  WHEN 'admin' THEN 'root'
  WHEN 'hiring_manager' THEN 'admin'
  WHEN 'recruiter' THEN 'admin'
  WHEN 'candidate' THEN 'user'
  ELSE 'user' END;--> statement-breakpoint
DROP TYPE "public"."role";--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('root', 'admin', 'user');--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."role" USING "role"::"public"."role";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'user';--> statement-breakpoint
ALTER TABLE "invitations" ALTER COLUMN "role" SET DATA TYPE "public"."role" USING "role"::"public"."role";--> statement-breakpoint
ALTER TABLE "invitations" ALTER COLUMN "role" SET DEFAULT 'user';
