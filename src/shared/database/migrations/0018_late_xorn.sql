ALTER TABLE "cont_common" ALTER COLUMN "pincode" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "cont_common" ALTER COLUMN "fk_user_id" DROP NOT NULL;