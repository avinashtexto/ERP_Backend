ALTER TABLE "attendance_locations" ADD COLUMN "fk_hl_id" integer;-->statement-breakpoint
ALTER TABLE "attendance_locations" ADD COLUMN "created_at" timestamp DEFAULT NOW();-->statement-breakpoint
