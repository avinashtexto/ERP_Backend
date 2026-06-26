ALTER TABLE "cont_city" ALTER COLUMN "pk_city_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "cont_city" ALTER COLUMN "pk_city_id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "cont_city_pk_city_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "cont_common" ALTER COLUMN "fk_city_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "cont_address" ALTER COLUMN "fk_city_id" SET DATA TYPE integer;