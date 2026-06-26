import { pgTable, varchar, boolean } from 'drizzle-orm/pg-core';

export const sal_m_attendance = pgTable('sal_m_attendance', {
  pk_at_id: varchar('pk_at_id', { length: 50 }).primaryKey().notNull(),
  fk_ss_id: varchar('fk_ss_id', { length: 50 }).notNull(),
  authorize: boolean('authorize').default(false),
});
