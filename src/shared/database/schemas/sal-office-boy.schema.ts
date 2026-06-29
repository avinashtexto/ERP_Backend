import { pgTable, varchar, integer, timestamp, text } from 'drizzle-orm/pg-core';

export const salOfficeBoy = pgTable('sal_office_boy', {
  pk_ob_id: integer('pk_ob_id').primaryKey().generatedByDefaultAsIdentity(),
  name: varchar('name', { length: 100 }).notNull(),
  mobile: varchar('mobile', { length: 15 }),
  email: varchar('email', { length: 100 }),
  address: text('address'),
  fk_user_id: integer('fk_user_id'),
  date_time_stamp: timestamp('date_time_stamp').defaultNow().notNull(),
  last_status: varchar('last_status', { length: 10 }).notNull(),
});

export type SalOfficeBoy = typeof salOfficeBoy.$inferSelect;
export type NewSalOfficeBoy = typeof salOfficeBoy.$inferInsert;
