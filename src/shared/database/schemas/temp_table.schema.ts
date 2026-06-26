import { pgTable, varchar, index } from 'drizzle-orm/pg-core';

export const temp_table = pgTable(
  'temp_table',
  {
    id: varchar('id', { length: 50 }).primaryKey().notNull(),
    temp_fields: varchar('temp_fields', { length: 100 }).notNull(),
  },
  (t) => [index('idx_temp_table_id').on(t.id)],
);
