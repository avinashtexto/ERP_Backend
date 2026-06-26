import { boolean, integer, numeric, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

export const sal_it_section = pgTable('sal_it_section', {
  pk_sec_id: integer('pk_sec_id').primaryKey().generatedByDefaultAsIdentity(),
  it_section: varchar('it_section', { length: 75 }).notNull(),
  deduction: numeric('deduction', {
    precision: 18,
    scale: 2,
  }),
  fk_fy_id: integer('fk_fy_id'),
  date_time_stamp: timestamp('date_time_stamp', {
    mode: 'date',
  }).defaultNow(),
  fk_user_id: integer('fk_user_id'),
  last_status: varchar('last_status', { length: 10 }),
  additraction: varchar('additraction', { length: 12 }),
});

export type SalItSection = typeof sal_it_section.$inferSelect;
export type NewSalItSection = typeof sal_it_section.$inferInsert;
