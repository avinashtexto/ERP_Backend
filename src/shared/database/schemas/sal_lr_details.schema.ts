import { pgTable, varchar, date, index, bigint, integer } from 'drizzle-orm/pg-core';

export const sal_lr_details = pgTable(
  'sal_lr_details',
  {
    pk_lrd_id: bigint("pk_lrd_id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
    fk_lr_id: integer("fk_lr_id").notNull(),
    lr_date: date("lr_date").notNull(),
    lr_day: varchar("lr_day", { length: 20 }),
    type: varchar("type", { length: 30 }),
    typ_id: varchar("typ_id", { length: 50 }),
  },
  (t) => [index('idx_sal_lr_details_fk_lr_id').on(t.fk_lr_id)],
);
