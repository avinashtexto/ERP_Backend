import { pgTable, varchar, date, index } from 'drizzle-orm/pg-core';

export const sal_m_atten_date = pgTable(
  'sal_m_atten_date',
  {
    pk_mad_id: varchar('pk_mad_id', { length: 50 }).primaryKey().notNull(),
    fk_at_id: varchar('fk_at_id', { length: 50 }).notNull(),
    a_date: date('a_date').notNull(),
    w_type: varchar('w_type', { length: 50 }),
  },
  (t) => [
    index('idx_sal_m_atten_date_at').on(t.fk_at_id),
    index('idx_sal_m_atten_date_w_type').on(t.w_type),
  ],
);
