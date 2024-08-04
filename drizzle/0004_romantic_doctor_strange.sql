ALTER TABLE "restaurant" DROP CONSTRAINT "restaurant_manager_id_user_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "restaurant" ADD CONSTRAINT "restaurant_manager_id_user_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
