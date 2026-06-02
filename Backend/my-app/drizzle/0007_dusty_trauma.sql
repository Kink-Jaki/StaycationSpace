ALTER TYPE "public"."payment_status" ADD VALUE 'uploaded';--> statement-breakpoint
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_customer_id_customers_id_fk";
--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "user_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_customers_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "customer_id";