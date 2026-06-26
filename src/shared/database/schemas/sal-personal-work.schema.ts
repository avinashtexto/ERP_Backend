import { pgTable, varchar, char, boolean, timestamp, integer, bigint } from 'drizzle-orm/pg-core';
import { salEmployee } from './index.js';
import { appUser } from './app-user.schema.js';

export const salPersonalWork = pgTable('sal_personal_work', {
  pk_pw_id: bigint('pk_pw_id', { mode: 'number' }).primaryKey().generatedByDefaultAsIdentity(),
  request_date: timestamp('request_date', { mode: 'date' }).notNull(),
  fk_emp_id: integer('fk_emp_id')
    .notNull()
    .references(() => salEmployee.pk_emp_id),
  leaving_time: timestamp('leaving_time', { mode: 'date' }).notNull(),
  return_time: timestamp('return_time', { mode: 'date' }).notNull(),
  break_time: integer('break_time').notNull(),
  reason: varchar('reason', { length: 250 }).notNull(),
  remarks: varchar('remarks', { length: 250 }).notNull(),
  date_timestamp: timestamp('date_timestamp', { mode: 'date' }).notNull().defaultNow(),
  fk_user_id: integer('fk_user_id')
    .notNull()
    .references(() => appUser.pk_user_id),
  last_status: varchar('last_status', { length: 10 }).notNull(),
  authorize: boolean('authorize').notNull(),
  a_timestamp: timestamp('a_timestamp', { mode: 'date' }),
  fk_a_user_id: integer('fk_a_user_id')
    .references(() => appUser.pk_user_id),
});

export type SalPersonalWork = typeof salPersonalWork.$inferSelect;
export type NewSalPersonalWork = typeof salPersonalWork.$inferInsert;
