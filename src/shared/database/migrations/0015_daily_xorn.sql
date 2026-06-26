CREATE TABLE "account_book" (
	"pk_book_id" char(23) PRIMARY KEY NOT NULL,
	"book_name" varchar(50) NOT NULL,
	"active" boolean NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"database_nar" varchar(50) NOT NULL,
	"product_id" numeric(18, 0) NOT NULL,
	"parent_id" numeric(18, 0) NOT NULL,
	"add_path" varchar(12) NOT NULL,
	"backup_path" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "active_server" (
	"active_server" varchar(50) NOT NULL,
	"product_id" integer NOT NULL,
	"parent_id" integer NOT NULL,
	"user_id" varchar(50) NOT NULL,
	"email" varchar(100),
	"mobile" varchar(20),
	"password" varchar(255) NOT NULL,
	"fk_book_id" char(23)
);
--> statement-breakpoint
CREATE TABLE "acct_group" (
	"pk_grp_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "acct_group_pk_grp_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"group_name" varchar(40) NOT NULL,
	"fk_main_id" integer NOT NULL,
	"fk_sub_id" integer NOT NULL,
	"fk_prt_id" integer NOT NULL,
	"grouping" integer NOT NULL,
	"prefix" varchar(1) NOT NULL,
	"dc" varchar(2) NOT NULL,
	"sync" char(1) DEFAULT 'N' NOT NULL,
	"sys_defined" boolean DEFAULT false NOT NULL,
	"date_time_stamp" timestamp NOT NULL,
	"fk_user_id" bigint NOT NULL,
	"last_status" varchar(10) NOT NULL,
	CONSTRAINT "acct_group_group_name_unique" UNIQUE("group_name")
);
--> statement-breakpoint
CREATE TABLE "sal_employee" (
	"pk_emp_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sal_employee_pk_emp_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"emp_code" varchar(30) NOT NULL,
	"fk_tit_id" char(5),
	"employee" varchar(50) NOT NULL,
	"doj" timestamp NOT NULL,
	"dob" timestamp,
	"photo" varchar(255),
	"fk_qual_id" char(5),
	"male" boolean NOT NULL,
	"married" boolean NOT NULL,
	"anni" timestamp,
	"p_address" varchar(255) NOT NULL,
	"n_address" varchar(255) NOT NULL,
	"fk_dep_id" char(5),
	"fk_deg_id" char(5),
	"fk_bnk_id" char(10),
	"account_no" varchar(20) NOT NULL,
	"pf_no" varchar(25) NOT NULL,
	"esic_no" varchar(25) NOT NULL,
	"pan_no" varchar(25) NOT NULL,
	"dol" timestamp,
	"blood_grp" varchar(6) NOT NULL,
	"wp" varchar(50) NOT NULL,
	"aadhar" varchar(50) NOT NULL,
	"cv_copy" varchar(50) NOT NULL,
	"le_copy" varchar(50) NOT NULL,
	"fk_m_doc_id" numeric(18, 0),
	"username" varchar(15) NOT NULL,
	"password" varchar(10) NOT NULL,
	"question" varchar(50) NOT NULL,
	"answer" varchar(50) NOT NULL,
	"ext" varchar(10) NOT NULL,
	"sync" char(1) NOT NULL,
	"sys_defined" boolean NOT NULL,
	"date_time_stamp" timestamp NOT NULL,
	"fk_user_id" char(5) NOT NULL,
	"last_status" varchar(10) NOT NULL,
	"rtgs" varchar(20) NOT NULL,
	"s_address" varchar(30) NOT NULL,
	"sb" boolean NOT NULL,
	"fk_set_id" char(5),
	"type" varchar(20) NOT NULL,
	"att_type" boolean NOT NULL,
	"height" numeric(18, 0),
	"weight" numeric(18, 2),
	"fk_rg_id" numeric(18, 0),
	"fk_cs_id" numeric(18, 0),
	"fk_st_id" numeric(18, 0),
	"mark" varchar(50) NOT NULL,
	"experience" varchar(5),
	"fk_r_emp_id" numeric(18, 0),
	"police" varchar(50) NOT NULL,
	"add_police" varchar(255) NOT NULL,
	"cont_police" varchar(25) NOT NULL,
	"fk_w1_emp_id" numeric(18, 0),
	"fk_w2_emp_id" numeric(18, 0),
	"personality1" varchar(50) NOT NULL,
	"fk_p1_des_id" char(5),
	"p1_address" varchar(255) NOT NULL,
	"p1_contact" varchar(25) NOT NULL,
	"personality2" varchar(50) NOT NULL,
	"fk_p2_des_id" char(5),
	"p2_address" varchar(255) NOT NULL,
	"p2_contact" varchar(25) NOT NULL,
	"messaging" boolean NOT NULL,
	"fk_acct_id" char(10),
	"geolocation" boolean NOT NULL,
	"employment" varchar(3) NOT NULL,
	"inform_pf" boolean,
	"inform_esic" boolean
);
--> statement-breakpoint
CREATE TABLE "app_questions" (
	"pk_question_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "app_questions_pk_question_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"questions" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_configuration" (
	"pk_ec_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "email_configuration_pk_ec_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"from_email" varchar(75) NOT NULL,
	"password" varchar(30) NOT NULL,
	"pop_server" varchar(30) NOT NULL,
	"pop_port" integer NOT NULL,
	"smtp_server" varchar(30) NOT NULL,
	"smtp_port" integer NOT NULL,
	"to_email" varchar(75) NOT NULL,
	"ssl" boolean NOT NULL,
	"sync" char(1) NOT NULL,
	"sys_defined" boolean NOT NULL,
	"date_time_stamp" timestamp NOT NULL,
	"fk_user_id" char(5) NOT NULL,
	"last_status" varchar(10) NOT NULL,
	"m_default" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cont_department" (
	"pk_dep_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "cont_department_pk_dep_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"department" varchar(30) NOT NULL,
	"sync" char(1) NOT NULL,
	"sys_defined" boolean NOT NULL,
	"date_time_stamp" timestamp NOT NULL,
	"fk_user_id" integer NOT NULL,
	"last_status" varchar(10) NOT NULL,
	CONSTRAINT "cont_department_department_unique" UNIQUE("department")
);
--> statement-breakpoint
CREATE TABLE "cont_designation" (
	"pk_des_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "cont_designation_pk_des_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"designation" varchar(30) NOT NULL,
	"sync" char(1) NOT NULL,
	"sys_defined" boolean NOT NULL,
	"date_time_stamp" timestamp NOT NULL,
	"fk_user_id" integer NOT NULL,
	"last_status" varchar(10) NOT NULL,
	"se" boolean NOT NULL,
	CONSTRAINT "cont_designation_designation_unique" UNIQUE("designation")
);
--> statement-breakpoint
CREATE TABLE "cont_qualification" (
	"pk_qua_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "cont_qualification_pk_qua_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"qualification" varchar(40) NOT NULL,
	"sync" char(1) NOT NULL,
	"sys_defined" boolean NOT NULL,
	"date_time_stamp" timestamp NOT NULL,
	"fk_user_id" integer NOT NULL,
	"last_status" varchar(10) NOT NULL,
	CONSTRAINT "cont_qualification_qualification_unique" UNIQUE("qualification")
);
--> statement-breakpoint
CREATE TABLE "cont_relationship" (
	"pk_rel_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "cont_relationship_pk_rel_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"relationship" varchar(30) NOT NULL,
	"sync" char(1) NOT NULL,
	"sys_defined" boolean NOT NULL,
	"date_time_stamp" timestamp NOT NULL,
	"fk_user_id" integer NOT NULL,
	"last_status" varchar(10) NOT NULL,
	CONSTRAINT "cont_relationship_relationship_unique" UNIQUE("relationship")
);
--> statement-breakpoint
CREATE TABLE "cont_title" (
	"pk_tit_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "cont_title_pk_tit_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" varchar(15) NOT NULL,
	"sync" char(1) NOT NULL,
	"sys_defined" boolean NOT NULL,
	"date_time_stamp" timestamp NOT NULL,
	"fk_user_id" integer NOT NULL,
	"last_status" varchar(10) NOT NULL,
	CONSTRAINT "cont_title_title_unique" UNIQUE("title")
);
--> statement-breakpoint
CREATE TABLE "cont_category" (
	"pk_cat_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "cont_category_pk_cat_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"category" varchar(30) NOT NULL,
	"sync" char(1) NOT NULL,
	"sys_defined" boolean NOT NULL,
	"date_time_stamp" timestamp NOT NULL,
	"fk_user_id" integer NOT NULL,
	"last_status" varchar(10) NOT NULL,
	CONSTRAINT "cont_category_category_unique" UNIQUE("category")
);
--> statement-breakpoint
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
	"pk_at_id" bigint PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "sal_attendance_pk_at_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"fk_ss_id" numeric(18, 0) NOT NULL,
	"at_date" timestamp NOT NULL,
	"w_type" integer NOT NULL,
	"time_in" timestamp,
	"time_out" timestamp,
	"m_break" integer,
	"w_hour" numeric(10, 2) NOT NULL,
	"aw_hour" numeric(18, 2),
	"overtime" numeric(10, 2),
	"bot" integer,
	"cal_ot" integer,
	"remarks" varchar(100) NOT NULL,
	"sync" char(1) NOT NULL,
	"sys_defined" boolean NOT NULL,
	"date_time_stamp" timestamp NOT NULL,
	"fk_user_id" varchar(5) NOT NULL,
	"last_status" varchar(10) NOT NULL,
	"authorize" boolean NOT NULL,
	"a_timestamp" timestamp,
	"fk_a_user_id" varchar(5),
	"a_hour" numeric(10, 2),
	"pw" boolean NOT NULL,
	"late_mark" integer,
	"uh1" integer,
	"fk_at1_id" numeric(18, 0),
	"uh2" integer,
	"fk_at2_id" numeric(18, 0),
	"uh3" integer,
	"fk_at3_id" numeric(18, 0),
	"f_apply" boolean,
	"extra_hours" integer,
	"imp_status" boolean NOT NULL,
	"latitude" numeric(18, 6),
	"longitude" numeric(18, 6),
	"min_late" integer,
	"min_plenty" integer,
	"inf_late" boolean,
	"min_early" numeric(18, 0),
	"inf_early" boolean,
	"break_time" numeric(18, 0),
	"at_time_in" timestamp,
	"at_time_out" timestamp,
	"m_time_in" timestamp,
	"m_time_out" timestamp,
	"s_time_in" timestamp,
	"s_time_out" timestamp,
	"fk_st_id" bigint
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
CREATE TABLE "sal_loan" (
	"pk_loan_id" varchar(50) PRIMARY KEY NOT NULL,
	"loan_no" varchar(20) NOT NULL,
	"loan_date" date NOT NULL,
	"fk_emp_id" varchar(50) NOT NULL,
	"loan_type" varchar(30) NOT NULL,
	"loan_amount" numeric(12, 2) NOT NULL,
	"voucher_no" varchar(30),
	"interest_rate" numeric(5, 2) DEFAULT '0.00',
	"installments" integer NOT NULL,
	"return_through" varchar(20) NOT NULL,
	"deduct_from_month" varchar(20) NOT NULL,
	"calc_method" varchar(50) NOT NULL,
	"remarks" varchar(200),
	"sys_defined" boolean DEFAULT false,
	"sync" varchar(5) DEFAULT 'N',
	"date_timestamp" timestamp DEFAULT now(),
	"fk_user_id" varchar(50),
	"last_status" varchar(30) DEFAULT 'Added',
	"authorize" boolean DEFAULT false,
	"a_timestamp" timestamp,
	"fk_a_user_id" varchar(50),
	"accepted" varchar(10) DEFAULT '',
	"a_remarks" varchar(200) DEFAULT '',
	CONSTRAINT "uq_sal_loan_loan_no" UNIQUE("loan_no")
);
--> statement-breakpoint
CREATE TABLE "sal_loan_schedule" (
	"pk_schedule_id" varchar(50) PRIMARY KEY NOT NULL,
	"fk_loan_id" varchar(50) NOT NULL,
	"inst_no" integer NOT NULL,
	"inst_month" varchar(20) NOT NULL,
	"principal_amount" numeric(12, 2) NOT NULL,
	"interest_amount" numeric(12, 2) NOT NULL,
	"add_interest_amount" numeric(12, 2) DEFAULT '0.00',
	"total_payable" numeric(12, 2) NOT NULL,
	"bal_principal" numeric(12, 2) NOT NULL,
	"status" varchar(20) DEFAULT 'Pending'
);
--> statement-breakpoint
CREATE TABLE "sal_personal_work" (
	"pk_pw_id" bigint PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "sal_personal_work_pk_pw_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"request_date" timestamp NOT NULL,
	"fk_emp_id" integer NOT NULL,
	"leaving_time" timestamp NOT NULL,
	"return_time" timestamp NOT NULL,
	"break_time" integer NOT NULL,
	"reason" varchar(250) NOT NULL,
	"remarks" varchar(250) NOT NULL,
	"sync" char(1) NOT NULL,
	"sys_defined" boolean NOT NULL,
	"date_timestamp" timestamp DEFAULT now() NOT NULL,
	"fk_user_id" integer NOT NULL,
	"last_status" varchar(10) NOT NULL,
	"authorize" boolean NOT NULL,
	"a_timestamp" timestamp,
	"fk_a_user_id" integer
);
--> statement-breakpoint
CREATE TABLE "sal_shift_timing" (
	"pk_st_id" bigint PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "sal_shift_timing_pk_st_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"shift" varchar(50) NOT NULL,
	"s_work" timestamp NOT NULL,
	"e_work" timestamp NOT NULL,
	"t_work" numeric(18, 2) NOT NULL,
	"s_break" timestamp NOT NULL,
	"e_break" timestamp NOT NULL,
	"t_break" numeric(18, 2) NOT NULL,
	"sd" boolean NOT NULL,
	"sync" char(1) NOT NULL,
	"sys_defined" boolean NOT NULL,
	"date_time_stamp" timestamp NOT NULL,
	"fk_user_id" varchar(5) NOT NULL,
	"last_status" varchar(10) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sal_structure" (
	"pk_ss_id" bigint PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "sal_structure_pk_ss_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"fk_emp_id" numeric(18, 0) NOT NULL,
	"sal_start" timestamp NOT NULL,
	"basic" numeric(18, 2) NOT NULL,
	"b_type" varchar(7) NOT NULL,
	"allowance" numeric(18, 2),
	"t_allowance" varchar(5) NOT NULL,
	"travelling" numeric(18, 2),
	"t_travelling" varchar(5) NOT NULL,
	"housing" numeric(18, 2),
	"t_housing" varchar(5) NOT NULL,
	"daily" numeric(18, 2),
	"t_daily" varchar(5) NOT NULL,
	"incentive" numeric(18, 2),
	"t_incentive" varchar(5) NOT NULL,
	"education" numeric(18, 2),
	"t_education" varchar(5) NOT NULL,
	"medical" numeric(18, 2),
	"t_medical" varchar(5) NOT NULL,
	"other" numeric(18, 2),
	"t_other" varchar(5) NOT NULL,
	"oti" numeric(18, 2),
	"toti" boolean NOT NULL,
	"otii" numeric(18, 2),
	"totii" boolean NOT NULL,
	"rday_i" varchar(10) NOT NULL,
	"rday_ii" varchar(10) NOT NULL,
	"ph" integer NOT NULL,
	"sl" numeric(10, 1) NOT NULL,
	"cl" numeric(10, 1) NOT NULL,
	"ucl" numeric(10, 1) NOT NULL,
	"wh" numeric(18, 2) NOT NULL,
	"rwh" numeric(18, 2) NOT NULL,
	"bl" integer NOT NULL,
	"bld" integer NOT NULL,
	"a_rule" varchar(10) NOT NULL,
	"otb" numeric(18, 0) NOT NULL,
	"cal_pt" boolean NOT NULL,
	"cal_pf" boolean NOT NULL,
	"cal_esic" boolean NOT NULL,
	"cal_tds" boolean NOT NULL,
	"slab_tds" integer,
	"revise" timestamp NOT NULL,
	"scan_mb" boolean,
	"fk_sacct_id" varchar(10) NOT NULL,
	"remarks" varchar(100) NOT NULL,
	"sync" char(1) NOT NULL,
	"sys_defined" boolean NOT NULL,
	"date_time_stamp" timestamp NOT NULL,
	"fk_user_id" varchar(5) NOT NULL,
	"last_status" varchar(10) NOT NULL,
	"other_basic" boolean NOT NULL,
	"eot" boolean NOT NULL,
	"ew_hour" boolean NOT NULL,
	"lyew_hour" numeric(19, 2) NOT NULL,
	"fk_lacct_id" varchar(10) NOT NULL,
	"ma_basic" boolean NOT NULL,
	"ea_basic" boolean NOT NULL,
	"incentive_basic" boolean NOT NULL,
	"da_basic" boolean NOT NULL,
	"ha_basic" boolean NOT NULL,
	"ta_basic" boolean NOT NULL,
	"allowance_basic" boolean NOT NULL,
	"fk_fcont_id" varchar(10),
	"fk_tcont_id" varchar(10),
	"sal_gross" numeric(18, 2) NOT NULL,
	"fk_iacct_id" varchar(10),
	"ab_penalty" numeric(18, 2) NOT NULL,
	"variant" boolean NOT NULL,
	"pfa" boolean NOT NULL,
	"pfta" boolean NOT NULL,
	"pfha" boolean NOT NULL,
	"pfi" boolean NOT NULL,
	"pfea" boolean NOT NULL,
	"pfma" boolean NOT NULL,
	"pfoa" boolean NOT NULL,
	"rd_variant" boolean NOT NULL,
	"retention" numeric(18, 2),
	"fk_emp1_id" numeric(18, 0),
	"fk_emp2_id" numeric(18, 0),
	"fk_racct_id" varchar(10),
	"sal_daily" numeric(18, 2),
	"set_pf" boolean NOT NULL,
	"sandwich" boolean NOT NULL,
	"gha" boolean NOT NULL,
	"rda" boolean NOT NULL,
	"iorf" boolean NOT NULL,
	"oaop" boolean NOT NULL,
	"ltime_roff" integer,
	"latitude" numeric(18, 6),
	"longitude" numeric(18, 6),
	"tds_deduct" numeric(18, 0) NOT NULL,
	"m_deduction" numeric(18, 2),
	"ded_description" varchar(100),
	"fk_des_id" varchar(5)
);
--> statement-breakpoint
ALTER TABLE "book" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "book" CASCADE;--> statement-breakpoint
ALTER TABLE "app_user" RENAME COLUMN "user_name" TO "username";--> statement-breakpoint
ALTER TABLE "app_user" RENAME COLUMN "datetime_stamp" TO "date_time_stamp";--> statement-breakpoint
ALTER TABLE "app_user_right" RENAME COLUMN "date_timestamp" TO "date_time_stamp";--> statement-breakpoint
ALTER TABLE "app_user_report" RENAME COLUMN "date_timestamp" TO "date_time_stamp";--> statement-breakpoint
ALTER TABLE "app_user_other" RENAME COLUMN "date_timestamp" TO "date_time_stamp";--> statement-breakpoint
ALTER TABLE "app_user" ALTER COLUMN "pk_user_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "app_user" ALTER COLUMN "pk_user_id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "app_user_pk_user_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "attendance_locations" ALTER COLUMN "id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "attendance_locations" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "attendance_locations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "attendance" ALTER COLUMN "id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "attendance" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "attendance_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "gps_attendance_logs" ALTER COLUMN "id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "gps_attendance_logs" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "gps_attendance_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "app_user" ADD COLUMN "security_question" varchar(200);--> statement-breakpoint
ALTER TABLE "app_user" ADD COLUMN "sal" varchar(10);--> statement-breakpoint
ALTER TABLE "app_user" ADD COLUMN "email" varchar(100);--> statement-breakpoint
ALTER TABLE "app_user" ADD COLUMN "security_question_id" integer;--> statement-breakpoint
ALTER TABLE "acct_group" ADD CONSTRAINT "acct_group_fk_main_id_acct_group_pk_grp_id_fk" FOREIGN KEY ("fk_main_id") REFERENCES "public"."acct_group"("pk_grp_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "acct_group" ADD CONSTRAINT "acct_group_fk_sub_id_acct_group_pk_grp_id_fk" FOREIGN KEY ("fk_sub_id") REFERENCES "public"."acct_group"("pk_grp_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "acct_group" ADD CONSTRAINT "acct_group_fk_prt_id_acct_group_pk_grp_id_fk" FOREIGN KEY ("fk_prt_id") REFERENCES "public"."acct_group"("pk_grp_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "acct_group" ADD CONSTRAINT "acct_group_fk_user_id_app_user_pk_user_id_fk" FOREIGN KEY ("fk_user_id") REFERENCES "public"."app_user"("pk_user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cont_department" ADD CONSTRAINT "cont_department_fk_user_id_app_user_pk_user_id_fk" FOREIGN KEY ("fk_user_id") REFERENCES "public"."app_user"("pk_user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cont_designation" ADD CONSTRAINT "cont_designation_fk_user_id_app_user_pk_user_id_fk" FOREIGN KEY ("fk_user_id") REFERENCES "public"."app_user"("pk_user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cont_qualification" ADD CONSTRAINT "cont_qualification_fk_user_id_app_user_pk_user_id_fk" FOREIGN KEY ("fk_user_id") REFERENCES "public"."app_user"("pk_user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cont_relationship" ADD CONSTRAINT "cont_relationship_fk_user_id_app_user_pk_user_id_fk" FOREIGN KEY ("fk_user_id") REFERENCES "public"."app_user"("pk_user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cont_title" ADD CONSTRAINT "cont_title_fk_user_id_app_user_pk_user_id_fk" FOREIGN KEY ("fk_user_id") REFERENCES "public"."app_user"("pk_user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cont_category" ADD CONSTRAINT "cont_category_fk_user_id_app_user_pk_user_id_fk" FOREIGN KEY ("fk_user_id") REFERENCES "public"."app_user"("pk_user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sal_attendance" ADD CONSTRAINT "sal_attendance_fk_ss_id_sal_structure_pk_ss_id_fk" FOREIGN KEY ("fk_ss_id") REFERENCES "public"."sal_structure"("pk_ss_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sal_attendance" ADD CONSTRAINT "sal_attendance_fk_st_id_sal_shift_timing_pk_st_id_fk" FOREIGN KEY ("fk_st_id") REFERENCES "public"."sal_shift_timing"("pk_st_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sal_loan_schedule" ADD CONSTRAINT "sal_loan_schedule_fk_loan_id_sal_loan_pk_loan_id_fk" FOREIGN KEY ("fk_loan_id") REFERENCES "public"."sal_loan"("pk_loan_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sal_personal_work" ADD CONSTRAINT "sal_personal_work_fk_emp_id_sal_employee_pk_emp_id_fk" FOREIGN KEY ("fk_emp_id") REFERENCES "public"."sal_employee"("pk_emp_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sal_personal_work" ADD CONSTRAINT "sal_personal_work_fk_user_id_app_user_pk_user_id_fk" FOREIGN KEY ("fk_user_id") REFERENCES "public"."app_user"("pk_user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sal_personal_work" ADD CONSTRAINT "sal_personal_work_fk_a_user_id_app_user_pk_user_id_fk" FOREIGN KEY ("fk_a_user_id") REFERENCES "public"."app_user"("pk_user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sal_structure" ADD CONSTRAINT "sal_structure_fk_emp_id_sal_employee_pk_emp_id_fk" FOREIGN KEY ("fk_emp_id") REFERENCES "public"."sal_employee"("pk_emp_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_sal_annual_leave_emp_year" ON "sal_annual_leave" USING btree ("fk_emp_id","cal_year");--> statement-breakpoint
CREATE INDEX "idx_sal_leave_encashment_emp_year" ON "sal_leave_encashment" USING btree ("fk_emp_id","le_year");--> statement-breakpoint
CREATE INDEX "idx_sal_sel_holidays_ss" ON "sal_sel_holidays" USING btree ("fk_ss_id");--> statement-breakpoint
CREATE INDEX "idx_sal_sel_holidays_sh" ON "sal_sel_holidays" USING btree ("fk_sh_id");--> statement-breakpoint
CREATE INDEX "idx_sal_m_atten_date_at" ON "sal_m_atten_date" USING btree ("fk_at_id");--> statement-breakpoint
CREATE INDEX "idx_sal_m_atten_date_w_type" ON "sal_m_atten_date" USING btree ("w_type");--> statement-breakpoint
CREATE INDEX "idx_sal_lr_request_date" ON "sal_leave_request" USING btree ("request_date");--> statement-breakpoint
CREATE INDEX "idx_sal_lr_fk_emp_id" ON "sal_leave_request" USING btree ("fk_emp_id");--> statement-breakpoint
CREATE INDEX "idx_sal_lr_fk_user_id" ON "sal_leave_request" USING btree ("fk_user_id");--> statement-breakpoint
CREATE INDEX "idx_sal_lr_authorize" ON "sal_leave_request" USING btree ("authorize");--> statement-breakpoint
CREATE INDEX "idx_sal_lr_details_fk_lr_id" ON "sal_lr_details" USING btree ("fk_lr_id");--> statement-breakpoint
CREATE INDEX "idx_hr_notification_form_nid" ON "hr_notification" USING btree ("form_name","n_id");--> statement-breakpoint
CREATE INDEX "idx_temp_table_id" ON "temp_table" USING btree ("id");--> statement-breakpoint
CREATE INDEX "idx_sal_loan_loan_date" ON "sal_loan" USING btree ("loan_date");--> statement-breakpoint
CREATE INDEX "idx_sal_loan_fk_emp_id" ON "sal_loan" USING btree ("fk_emp_id");--> statement-breakpoint
CREATE INDEX "idx_sal_loan_fk_user_id" ON "sal_loan" USING btree ("fk_user_id");--> statement-breakpoint
CREATE INDEX "idx_sal_loan_authorize" ON "sal_loan" USING btree ("authorize");--> statement-breakpoint
CREATE INDEX "idx_sal_loan_schedule_fk_loan_id" ON "sal_loan_schedule" USING btree ("fk_loan_id");--> statement-breakpoint
CREATE INDEX "idx_sal_loan_schedule_inst_month" ON "sal_loan_schedule" USING btree ("inst_month");--> statement-breakpoint
ALTER TABLE "app_user" ADD CONSTRAINT "app_user_security_question_id_app_questions_pk_question_id_fk" FOREIGN KEY ("security_question_id") REFERENCES "public"."app_questions"("pk_question_id") ON DELETE no action ON UPDATE no action;