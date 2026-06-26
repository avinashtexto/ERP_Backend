import { pgTable, varchar, char, boolean, integer, numeric } from 'drizzle-orm/pg-core';

export const accountBookTable = pgTable('account_book', {
  pk_book_id: integer('pk_book_id').primaryKey().generatedByDefaultAsIdentity(),
  book_name: varchar('book_name', { length: 50 }).notNull(),
  active: boolean('active').notNull(),
  file_name: varchar('file_name', { length: 255 }).notNull(),
  database_name: varchar('database_name', { length: 50 }).notNull(),
  product_id: numeric('product_id', { precision: 18, scale: 0 }).notNull(),
  parent_id: numeric('parent_id', { precision: 18, scale: 0 }).notNull(),
  add_path: varchar('add_path', { length: 12 }).notNull(),
  backup_path: varchar('backup_path', { length: 255 }).notNull(),
});

export const activeServerTable = pgTable('active_server', {
  active_server: varchar('active_server', { length: 50 }).notNull(),
  product_id: integer('product_id').notNull(),
  parent_id: integer('parent_id').notNull(),
  user_id: varchar('user_id', { length: 50 }).notNull(),
  email: varchar('email', { length: 100 }),
  mobile: varchar('mobile', { length: 20 }),
  password: varchar('password', { length: 255 }).notNull(),
  fk_book_id: integer('fk_book_id').references(() => accountBookTable.pk_book_id),
});
