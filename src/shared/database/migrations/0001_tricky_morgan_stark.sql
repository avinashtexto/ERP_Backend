ALTER TABLE "app_user" RENAME COLUMN "user_name" TO "username";--> statement-breakpoint
ALTER TABLE "app_user" RENAME COLUMN "datetime_stamp" TO "date_time_stamp";--> statement-breakpoint
ALTER TABLE "app_user_right" RENAME COLUMN "date_timestamp" TO "date_time_stamp";--> statement-breakpoint
ALTER TABLE "app_user_report" RENAME COLUMN "date_timestamp" TO "date_time_stamp";--> statement-breakpoint
ALTER TABLE "app_user_other" RENAME COLUMN "date_timestamp" TO "date_time_stamp";--> statement-breakpoint
ALTER TABLE "sal_employee" RENAME COLUMN "date_timestamp" TO "date_time_stamp";--> statement-breakpoint
ALTER TABLE "email_configuration" RENAME COLUMN "date_timestamp" TO "date_time_stamp";--> statement-breakpoint
ALTER TABLE "app_user" ADD COLUMN "security_question_id" integer;--> statement-breakpoint
ALTER TABLE "app_user" ADD COLUMN "security_question" varchar(200);--> statement-breakpoint
ALTER TABLE "app_user" ADD COLUMN "sal" varchar(10);--> statement-breakpoint
ALTER TABLE "app_user" ADD CONSTRAINT "app_user_security_question_id_app_questions_pk_question_id_fk" FOREIGN KEY ("security_question_id") REFERENCES "public"."app_questions"("pk_question_id") ON DELETE no action ON UPDATE no action;