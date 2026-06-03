ALTER TABLE "spaces" ADD COLUMN "address" text NOT NULL;--> statement-breakpoint
ALTER TABLE "spaces" ADD COLUMN "deposit" numeric(12, 2) DEFAULT '0' NOT NULL;