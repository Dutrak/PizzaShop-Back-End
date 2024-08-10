ALTER TABLE "orders" RENAME COLUMN "costumer_id" TO "customer_id";--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT "orders_costumer_id_user_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_user_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
