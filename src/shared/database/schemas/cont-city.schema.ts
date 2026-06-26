import { relations } from 'drizzle-orm';
import { pgTable, char, varchar, boolean, timestamp, integer, index } from 'drizzle-orm/pg-core';

import { appUser } from '@/shared/database/schemas/app-user.schema.js';
import { cont_country } from '@/shared/database/schemas/cont-country.schema.js';
import { cont_state } from '@/shared/database/schemas/cont-state.schema.js';

// ─────────────────────────────────────────────
// cont_city
// ─────────────────────────────────────────────
export const cont_city = pgTable(
  'cont_city',
  {
    pk_city_id: integer('pk_city_id').primaryKey().generatedByDefaultAsIdentity(),

    city: varchar('city', { length: 30 }).notNull(),

    fk_state_id: integer('fk_state_id').references(() => cont_state.pk_state_id),

    fk_ctry_id: integer('fk_ctry_id')
      .notNull()
      .references(() => cont_country.pk_ctry_id),

    std_code: varchar('std_code', { length: 10 }).notNull().default(''),

    date_time_stamp: timestamp('date_time_stamp', { mode: 'date' }).notNull().defaultNow(),

    fk_user_id: integer('fk_user_id')
      .notNull()
      .references(() => appUser.pk_user_id),

    last_status: varchar('last_status', { length: 10 }).notNull().default(''),
  },
  (table) => ({
    ix_cont_city_city: index('ix_cont_city_city').on(table.city),
  }),
);

// ─────────────────────────────────────────────
// Relations
// ─────────────────────────────────────────────
export const cont_city_relations = relations(cont_city, ({ one }) => ({
  state: one(cont_state, {
    fields: [cont_city.fk_state_id],
    references: [cont_state.pk_state_id],
  }),
  country: one(cont_country, {
    fields: [cont_city.fk_ctry_id],
    references: [cont_country.pk_ctry_id],
  }),
  user: one(appUser, {
    fields: [cont_city.fk_user_id],
    references: [appUser.pk_user_id],
  }),
}));

export type ContCity = typeof cont_city.$inferSelect;
export type NewContCity = typeof cont_city.$inferInsert;
