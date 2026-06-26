import { pgTable, integer, varchar, char, boolean, timestamp } from 'drizzle-orm/pg-core';

// ─── sal_nature_of_work ────────────────────────────────────────────────────────
export const sal_nature_of_work = pgTable('sal_nature_of_work', {
  pk_nw_id: integer('pk_nw_id').primaryKey().generatedByDefaultAsIdentity(),
  nature_of_work: varchar('nature_of_work', { length: 40 }).notNull(),
  date_timestamp: timestamp('date_timestamp'),
  fk_user_id: integer('fk_user_id'),
  last_status: varchar('last_status', { length: 10 }),
});

export type SalNatureOfWork = typeof sal_nature_of_work.$inferSelect;
export type NewSalNatureOfWork = typeof sal_nature_of_work.$inferInsert;
