import { pgTable, varchar, char, boolean, timestamp, numeric, bigint } from "drizzle-orm/pg-core";

export const sal_shift_timing = pgTable(
  "sal_shift_timing",
  {
    pk_st_id: bigint("pk_st_id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
    shift: varchar("shift", { length: 50 }).notNull(),
    s_work: timestamp("s_work", { mode: "date" }).notNull(),
    e_work: timestamp("e_work", { mode: "date" }).notNull(),
    t_work: numeric("t_work", { precision: 18, scale: 2 }).notNull(),
    s_break: timestamp("s_break", { mode: "date" }).notNull(),
    e_break: timestamp("e_break", { mode: "date" }).notNull(),
    t_break: numeric("t_break", { precision: 18, scale: 2 }).notNull(),
    sd: boolean("sd").notNull(),
    date_time_stamp: timestamp("date_time_stamp", { mode: "date" }).notNull(),
    fk_user_id: varchar("fk_user_id", { length: 5 }).notNull(),
    last_status: varchar("last_status", { length: 10 }).notNull(),
  }
);
