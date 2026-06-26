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
ALTER TABLE "cont_department" ADD CONSTRAINT "cont_department_fk_user_id_app_user_pk_user_id_fk" FOREIGN KEY ("fk_user_id") REFERENCES "public"."app_user"("pk_user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cont_designation" ADD CONSTRAINT "cont_designation_fk_user_id_app_user_pk_user_id_fk" FOREIGN KEY ("fk_user_id") REFERENCES "public"."app_user"("pk_user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cont_qualification" ADD CONSTRAINT "cont_qualification_fk_user_id_app_user_pk_user_id_fk" FOREIGN KEY ("fk_user_id") REFERENCES "public"."app_user"("pk_user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cont_relationship" ADD CONSTRAINT "cont_relationship_fk_user_id_app_user_pk_user_id_fk" FOREIGN KEY ("fk_user_id") REFERENCES "public"."app_user"("pk_user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cont_title" ADD CONSTRAINT "cont_title_fk_user_id_app_user_pk_user_id_fk" FOREIGN KEY ("fk_user_id") REFERENCES "public"."app_user"("pk_user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cont_category" ADD CONSTRAINT "cont_category_fk_user_id_app_user_pk_user_id_fk" FOREIGN KEY ("fk_user_id") REFERENCES "public"."app_user"("pk_user_id") ON DELETE no action ON UPDATE no action;