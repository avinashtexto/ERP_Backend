import { relations } from 'drizzle-orm';
import { pgTable, char, varchar, numeric, boolean, timestamp, integer } from 'drizzle-orm/pg-core';

import { appUser } from '@/shared/database/schemas/app-user.schema.js';
import { cont_city } from '@/shared/database/schemas/cont-city.schema.js';

// ─────────────────────────────────────────────
// cont_address
// ─────────────────────────────────────────────
export const cont_address = pgTable('cont_address', {
  pk_ca_id: integer('pk_ca_id').primaryKey().generatedByDefaultAsIdentity(),

  fk_cont_id: integer('fk_cont_id').references(() => cont_common.pk_cont_id),

  address: varchar('address', { length: 150 }).notNull(),

  fk_city_id: integer('fk_city_id').references(() => cont_city.pk_city_id),

  region: varchar('region', { length: 50 }).notNull().default(''),

  pincode: varchar('pincode', { length: 50 }),

  date_time_stamp: timestamp('date_time_stamp').notNull().defaultNow(),

  fk_user_id: integer('fk_user_id')
    .notNull()
    .references(() => appUser.pk_user_id),

  last_status: varchar('last_status', { length: 10 }).notNull().default(''),
});

// ─────────────────────────────────────────────
// Relations
// ─────────────────────────────────────────────
export const cont_address_relations = relations(cont_address, ({ one }) => ({
  contact: one(cont_common, {
    fields: [cont_address.fk_cont_id],
    references: [cont_common.pk_cont_id],
  }),
  city: one(cont_city, {
    fields: [cont_address.fk_city_id],
    references: [cont_city.pk_city_id],
  }),
  user: one(appUser, {
    fields: [cont_address.fk_user_id],
    references: [appUser.pk_user_id],
  }),
}));

export type ContAddress = typeof cont_address.$inferSelect;
export type NewContAddress = typeof cont_address.$inferInsert;

// ─────────────────────────────────────────────
// Lazy import to avoid circular dependency
// cont_common imports cont_city; cont_address imports cont_common
// ─────────────────────────────────────────────
import { cont_common } from '@/shared/database/schemas/cont-common.schema.js';
