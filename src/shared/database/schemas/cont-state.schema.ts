import { relations } from 'drizzle-orm';
import { pgTable, char, varchar, boolean, timestamp, integer } from 'drizzle-orm/pg-core';

import { appUser } from './app-user.schema.js';
import { cont_country } from './cont-country.schema.js';

// ─────────────────────────────────────────────
// cont_state
// ─────────────────────────────────────────────
export const cont_state = pgTable('cont_state', {
  pk_state_id: integer('pk_state_id').primaryKey().generatedByDefaultAsIdentity(),

  state: varchar('state', { length: 30 }).notNull(),

  fk_ctry_id: integer('fk_ctry_id')
    .notNull()
    .references(() => cont_country.pk_ctry_id),

  state_code: varchar('state_code', { length: 10 }).notNull().default(''),

  date_time_stamp: timestamp('date_time_stamp', { mode: 'date' }).notNull().defaultNow(),

  fk_user_id: integer('fk_user_id')
    .notNull()
    .references(() => appUser.pk_user_id),

  last_status: varchar('last_status', { length: 10 }).notNull().default(''),
});

// ─────────────────────────────────────────────
// Relations
// ─────────────────────────────────────────────
export const cont_state_relations = relations(cont_state, ({ one, many }) => ({
  country: one(cont_country, {
    fields: [cont_state.fk_ctry_id],
    references: [cont_country.pk_ctry_id],
  }),

  user: one(appUser, {
    fields: [cont_state.fk_user_id],
    references: [appUser.pk_user_id],
  }),
}));

export type ContState = typeof cont_state.$inferSelect;
export type NewContState = typeof cont_state.$inferInsert;
