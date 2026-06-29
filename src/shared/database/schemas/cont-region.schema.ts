import { relations } from 'drizzle-orm';
import {
  pgTable,
  integer,
  varchar,
  numeric,
  char,
  boolean,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core';

import { appUser } from './app-user.schema.js';

export const contRegion = pgTable(
  'cont_region',
  {
    pk_reg_id: integer('pk_reg_id').primaryKey().generatedByDefaultAsIdentity(),
    region: varchar('region', { length: 30 }).notNull(),
    rate1: numeric('rate1', { precision: 19, scale: 2 }).notNull(),
    rate2: numeric('rate2', { precision: 19, scale: 2 }).notNull(),
    date_timestamp: timestamp('date_timestamp').notNull(),
    fk_user_id: integer('fk_user_id')
      .notNull()
      .references(() => appUser.pk_user_id),
    last_status: varchar('last_status', { length: 10 }).notNull(),
  },
  (t) => [unique('ix_cont_region').on(t.region)],
);

export const contRegionRelations = relations(contRegion, ({ one }) => ({
  created_by: one(appUser, {
    fields: [contRegion.fk_user_id],
    references: [appUser.pk_user_id],
  }),
}));

export type ContRegion = typeof contRegion.$inferSelect;
export type NewContRegion = typeof contRegion.$inferInsert;
