import { relations } from 'drizzle-orm';
import { pgTable, char, varchar, numeric, boolean, timestamp, integer } from 'drizzle-orm/pg-core';

import { appUser } from '@/shared/database/schemas/app-user.schema.js';
import { cont_city } from '@/shared/database/schemas/cont-city.schema.js';
import { salEmployee } from '@/shared/database/schemas/index.js';

// ─────────────────────────────────────────────
// cont_common
// ─────────────────────────────────────────────
export const cont_common = pgTable('cont_common', {
  pk_cont_id: integer('pk_cont_id').primaryKey().generatedByDefaultAsIdentity(),
  type: char('type', { length: 1 }).notNull().default('O'), // 'I' for Individual, 'O' for Organization
  contact_name: varchar('contact_name', { length: 50 }).notNull(),
  address: varchar('address', { length: 150 }).notNull().default(''),
  fk_city_id: integer('fk_city_id').references(() => cont_city.pk_city_id, { onUpdate: 'cascade' }),
  region: varchar('region', { length: 50 }).notNull().default(''),
  pincode: varchar('pincode', {
    length: 50,
  }),
  date_time_stamp: timestamp('date_time_stamp').notNull().defaultNow(),
  fk_user_id: integer('fk_user_id').references(() => appUser.pk_user_id, { onUpdate: 'cascade' }),
  last_status: varchar('last_status', { length: 10 }).notNull().default(''),
  postfix: varchar('postfix', { length: 25 }).notNull().default(''),
  fk_emp_id: integer('fk_emp_id').references(() => salEmployee.pk_emp_id),
  fk_a_user_id: integer('fk_a_user_id').references(() => appUser.pk_user_id),
  a_timestamp: timestamp('a_timestamp'),
  username: varchar('username', { length: 40 }),
  password: varchar('password', { length: 20 }),
  question: varchar('question', { length: 50 }),
  answer: varchar('answer', { length: 50 }),
  client_id: varchar('client_id', { length: 30 }).notNull().default(''),
});

// ─────────────────────────────────────────────
// Relations
// ─────────────────────────────────────────────
export const cont_common_relations = relations(cont_common, ({ one, many }) => ({
  city: one(cont_city, {
    fields: [cont_common.fk_city_id],
    references: [cont_city.pk_city_id],
  }),

  user: one(appUser, {
    fields: [cont_common.fk_user_id],
    references: [appUser.pk_user_id],
    relationName: 'user',
  }),

  approved_user: one(appUser, {
    fields: [cont_common.fk_a_user_id],
    references: [appUser.pk_user_id],
    relationName: 'approved_user',
  }),

  employee: one(salEmployee, {
    fields: [cont_common.fk_emp_id],
    references: [salEmployee.pk_emp_id],
  }),
}));

export type ContCommon = typeof cont_common.$inferSelect;
export type NewContCommon = typeof cont_common.$inferInsert;
