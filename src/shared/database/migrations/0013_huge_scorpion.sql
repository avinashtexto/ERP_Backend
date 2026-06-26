CREATE TABLE "sal_annual_leave" (
	"pk_sal_id" varchar(50) PRIMARY KEY NOT NULL,
	"fk_emp_id" varchar(50) NOT NULL,
	"cal_year" integer NOT NULL,
	"al_roff" varchar(20) DEFAULT '0',
	"py_bal" varchar(20) DEFAULT '0',
	"tot_al" varchar(20) DEFAULT '0'
);
--> statement-breakpoint
CREATE TABLE "sal_leave_encashment" (
	"pk_sle_id" varchar(50) PRIMARY KEY NOT NULL,
	"fk_emp_id" varchar(50) NOT NULL,
	"le_year" integer NOT NULL,
	"e_day" varchar(20) DEFAULT '0'
);
--> statement-breakpoint
CREATE TABLE "sal_holidays" (
	"pk_sh_id" varchar(50) PRIMARY KEY NOT NULL,
	"holiday_date" date NOT NULL,
	"holiday_name" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "sal_sel_holidays" (
	"pk_sel_id" varchar(50) PRIMARY KEY NOT NULL,
	"fk_ss_id" varchar(50) NOT NULL,
	"fk_sh_id" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sal_attendance" (
	"pk_at_id" varchar(50) PRIMARY KEY NOT NULL,
	"fk_ss_id" varchar(50) NOT NULL,
	"at_date" date NOT NULL,
	"w_type" varchar(50),
	"authorize" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "sal_m_attendance" (
	"pk_at_id" varchar(50) PRIMARY KEY NOT NULL,
	"fk_ss_id" varchar(50) NOT NULL,
	"authorize" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "sal_m_atten_date" (
	"pk_mad_id" varchar(50) PRIMARY KEY NOT NULL,
	"fk_at_id" varchar(50) NOT NULL,
	"a_date" date NOT NULL,
	"w_type" varchar(50)
);
--> statement-breakpoint
CREATE TABLE "sal_leave_request" (
	"pk_lr_id" varchar(50) PRIMARY KEY NOT NULL,
	"request_no" varchar(20) NOT NULL,
	"request_date" date NOT NULL,
	"from_date" date NOT NULL,
	"to_date" date NOT NULL,
	"fk_emp_id" varchar(50) NOT NULL,
	"bal_leave" varchar(20) DEFAULT '0',
	"bal_paid" varchar(20) DEFAULT '0',
	"bal_sick" varchar(20) DEFAULT '0',
	"bal_paid_casual" varchar(20) DEFAULT '0',
	"bal_unpaid_casual" varchar(20) DEFAULT '0',
	"rest_day" varchar(20) DEFAULT '0',
	"unpaid_leave" varchar(20) DEFAULT '0',
	"paid_holiday" varchar(20) DEFAULT '0',
	"sick_leave" varchar(20) DEFAULT '0',
	"paid_casual" varchar(20) DEFAULT '0',
	"unpaid_casual" varchar(20) DEFAULT '0',
	"maternity" varchar(20) DEFAULT '0',
	"paid_leave" varchar(20) DEFAULT '0',
	"total_leave" varchar(20) DEFAULT '0',
	"absent" varchar(20) DEFAULT '0',
	"reason" varchar(100),
	"remarks" varchar(100),
	"sys_defined" boolean DEFAULT false,
	"sync" varchar(5),
	"date_timestamp" timestamp,
	"fk_user_id" varchar(50),
	"last_status" varchar(30),
	"authorize" boolean DEFAULT false,
	"a_timestamp" timestamp,
	"fk_a_user_id" varchar(50),
	"accepted" varchar(10),
	"a_remarks" varchar(200),
	CONSTRAINT "uq_sal_lr_request_no" UNIQUE("request_no")
);
--> statement-breakpoint
CREATE TABLE "sal_lr_details" (
	"pk_lrd_id" varchar(50) PRIMARY KEY NOT NULL,
	"fk_lr_id" varchar(50) NOT NULL,
	"lr_date" date NOT NULL,
	"lr_day" varchar(20),
	"type" varchar(30),
	"typ_id" varchar(50)
);
--> statement-breakpoint
CREATE TABLE "hr_notification" (
	"pk_notif_id" varchar(50) PRIMARY KEY NOT NULL,
	"not_date" timestamp DEFAULT now() NOT NULL,
	"form_name" varchar(100) NOT NULL,
	"announcement" text,
	"file_name" varchar(255),
	"s_id" varchar(50),
	"n_id" varchar(50) NOT NULL,
	"edit_mode" smallint,
	"fk_user_id" varchar(50),
	"fk_set_id" varchar(50),
	"authorize" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "temp_table" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"temp_fields" varchar(100) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cont_country" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "cont_state" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "cont_city" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "cont_common" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "cont_address" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "cont_country" CASCADE;--> statement-breakpoint
DROP TABLE "cont_state" CASCADE;--> statement-breakpoint
DROP TABLE "cont_city" CASCADE;--> statement-breakpoint
DROP TABLE "cont_common" CASCADE;--> statement-breakpoint
DROP TABLE "cont_address" CASCADE;--> statement-breakpoint
ALTER TABLE "active_server" DROP CONSTRAINT "active_server_fk_book_id_account_book_pk_book_id_fk";
--> statement-breakpoint
ALTER TABLE "acct_group" ALTER COLUMN "pk_grp_id" SET GENERATED ALWAYS;--> statement-breakpoint
ALTER TABLE "app_user" ADD COLUMN "email" varchar(100);--> statement-breakpoint
ALTER TABLE "active_server" ADD COLUMN "email" varchar(100);--> statement-breakpoint
ALTER TABLE "active_server" ADD COLUMN "mobile" varchar(20);--> statement-breakpoint
CREATE INDEX "idx_sal_annual_leave_emp_year" ON "sal_annual_leave" USING btree ("fk_emp_id","cal_year");--> statement-breakpoint
CREATE INDEX "idx_sal_leave_encashment_emp_year" ON "sal_leave_encashment" USING btree ("fk_emp_id","le_year");--> statement-breakpoint
CREATE INDEX "idx_sal_sel_holidays_ss" ON "sal_sel_holidays" USING btree ("fk_ss_id");--> statement-breakpoint
CREATE INDEX "idx_sal_sel_holidays_sh" ON "sal_sel_holidays" USING btree ("fk_sh_id");--> statement-breakpoint
CREATE INDEX "idx_sal_attendance_ss_date" ON "sal_attendance" USING btree ("fk_ss_id","at_date");--> statement-breakpoint
CREATE INDEX "idx_sal_attendance_w_type" ON "sal_attendance" USING btree ("w_type");--> statement-breakpoint
CREATE INDEX "idx_sal_m_atten_date_at" ON "sal_m_atten_date" USING btree ("fk_at_id");--> statement-breakpoint
CREATE INDEX "idx_sal_m_atten_date_w_type" ON "sal_m_atten_date" USING btree ("w_type");--> statement-breakpoint
CREATE INDEX "idx_sal_lr_request_date" ON "sal_leave_request" USING btree ("request_date");--> statement-breakpoint
CREATE INDEX "idx_sal_lr_fk_emp_id" ON "sal_leave_request" USING btree ("fk_emp_id");--> statement-breakpoint
CREATE INDEX "idx_sal_lr_fk_user_id" ON "sal_leave_request" USING btree ("fk_user_id");--> statement-breakpoint
CREATE INDEX "idx_sal_lr_authorize" ON "sal_leave_request" USING btree ("authorize");--> statement-breakpoint
CREATE INDEX "idx_sal_lr_details_fk_lr_id" ON "sal_lr_details" USING btree ("fk_lr_id");--> statement-breakpoint
CREATE INDEX "idx_hr_notification_form_nid" ON "hr_notification" USING btree ("form_name","n_id");--> statement-breakpoint
CREATE INDEX "idx_temp_table_id" ON "temp_table" USING btree ("id");