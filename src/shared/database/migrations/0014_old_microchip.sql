CREATE TABLE "sal_nature_of_work" (
	"pk_nw_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sal_nature_of_work_pk_nw_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"nature_of_work" varchar(40) NOT NULL,
	"sync" char(1),
	"sys_defined" boolean DEFAULT false,
	"date_timestamp" timestamp,
	"fk_user_id" char(5),
	"last_status" varchar(10)
);
