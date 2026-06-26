import { relations } from 'drizzle-orm';
import { pgTable, char, varchar, integer } from 'drizzle-orm/pg-core';

import { contMoc } from './cont-mode-of-contact.schema.js';

export const contMocType = pgTable('cont_moc_type', {
  pk_mt_id: integer('pk_mt_id').primaryKey().generatedByDefaultAsIdentity(),
  mode: varchar('mode', { length: 6 }).notNull(),
});

export const contMocTypeRelations = relations(contMocType, ({ many }) => ({
  mode_of_contacts: many(contMoc),
}));

export type ContMocType = typeof contMocType.$inferSelect;
export type NewContMocType = typeof contMocType.$inferInsert;
