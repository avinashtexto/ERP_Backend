CREATE TABLE "sal_religion" (
	"pk_rg_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sal_religion_pk_rg_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"religion" varchar(50),
	"sync" char(1),
	"sys_defined" boolean,
	"date_time_stamp" timestamp,
	"fk_user_id" char(5),
	"last_status" varchar(10)
);
--> statement-breakpoint
CREATE TABLE "sal_castes" (
	"pk_cs_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sal_castes_pk_cs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"caste" varchar(40),
	"sync" char(1),
	"sys_defined" boolean,
	"date_time_stamp" timestamp,
	"fk_user_id" char(5),
	"last_status" varchar(10)
);
--> statement-breakpoint
CREATE TABLE "sal_schedule_type" (
	"pk_st_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sal_schedule_type_pk_st_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"type" varchar(100),
	"sync" char(1),
	"sys_defined" boolean,
	"date_time_stamp" timestamp,
	"fk_user_id" char(5),
	"last_status" varchar(10)
);
--> statement-breakpoint
CREATE TABLE "sal_skintone" (
	"pk_st_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sal_skintone_pk_st_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"colour" varchar(25),
	"sync" char(1),
	"sys_defined" boolean,
	"date_time_stamp" timestamp,
	"fk_user_id" char(5),
	"last_status" varchar(10)
);
