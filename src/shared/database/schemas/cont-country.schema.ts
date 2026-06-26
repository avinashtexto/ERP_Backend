import { pgTable, varchar, integer } from 'drizzle-orm/pg-core';

// ─────────────────────────────────────────────
// cont_country
// ─────────────────────────────────────────────
export const cont_country = pgTable('cont_country', {
  pk_ctry_id: integer('pk_ctry_id').primaryKey().generatedByDefaultAsIdentity(),
  country: varchar('country', { length: 50 }).notNull(),
  isd_code: varchar('isd_code', { length: 20 }).notNull(),
});

export type ContCountry = typeof cont_country.$inferSelect;
export type NewContCountry = typeof cont_country.$inferInsert;
