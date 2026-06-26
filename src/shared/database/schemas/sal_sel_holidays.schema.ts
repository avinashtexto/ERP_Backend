import { pgTable, varchar, index } from 'drizzle-orm/pg-core';

export const sal_sel_holidays = pgTable(
  'sal_sel_holidays',
  {
    pk_sel_id: varchar('pk_sel_id', { length: 50 }).primaryKey().notNull(),
    fk_ss_id: varchar('fk_ss_id', { length: 50 }).notNull(),
    fk_sh_id: varchar('fk_sh_id', { length: 50 }).notNull(),
  },
  (t) => [
    index('idx_sal_sel_holidays_ss').on(t.fk_ss_id),
    index('idx_sal_sel_holidays_sh').on(t.fk_sh_id),
  ],
);
