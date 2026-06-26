ALTER TABLE "admin_sessions" ALTER COLUMN "session_id" SET GENERATED ALWAYS;--> statement-breakpoint
ALTER TABLE "user_sessions" ALTER COLUMN "session_id" SET GENERATED ALWAYS;--> statement-breakpoint
ALTER TABLE "account_book" ALTER COLUMN "pk_book_id" SET DATA TYPE integer USING "pk_book_id"::integer;--> statement-breakpoint
ALTER TABLE "account_book" ALTER COLUMN "pk_book_id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "account_book_pk_book_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "account_book" ALTER COLUMN "product_id" SET DATA TYPE integer USING "product_id"::integer;--> statement-breakpoint
ALTER TABLE "active_server" ALTER COLUMN "fk_book_id" SET DATA TYPE integer USING "fk_book_id"::integer;