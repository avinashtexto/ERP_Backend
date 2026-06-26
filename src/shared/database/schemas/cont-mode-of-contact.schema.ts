import { relations } from 'drizzle-orm';
import { pgTable, char, varchar, boolean, timestamp, unique, integer } from 'drizzle-orm/pg-core';

import { appUser } from './app-user.schema.js';
import { contMocType } from './cont-moc-type.schema.js';

export const contMoc = pgTable(
  'cont_moc',
  {
    pk_moc_id: integer('pk_moc_id').primaryKey().generatedByDefaultAsIdentity(),
    moc: varchar('moc', { length: 25 }).notNull(),
    fk_mt_id: integer('fk_mt_id')
      .notNull()
      .references(() => contMocType.pk_mt_id),
    date_timestamp: timestamp('date_timestamp', { mode: 'date' }).notNull(),
    fk_user_id: integer('fk_user_id')
      .notNull()
      .references(() => appUser.pk_user_id),
    last_status: varchar('last_status', { length: 10 }).notNull(),
  },
  (t) => [unique('ix_cont_moc').on(t.moc)],
);

export const contMocRelations = relations(contMoc, ({ one }) => ({
  moc_type: one(contMocType, {
    fields: [contMoc.fk_mt_id],
    references: [contMocType.pk_mt_id],
  }),
  created_by: one(appUser, {
    fields: [contMoc.fk_user_id],
    references: [appUser.pk_user_id],
  }),
}));

export type ContMoc = typeof contMoc.$inferSelect;
export type NewContMoc = typeof contMoc.$inferInsert;
