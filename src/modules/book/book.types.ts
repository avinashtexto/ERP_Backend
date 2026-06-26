import { accountBookTable } from '@/shared/database/schemas/account-book.schema.js';

export type Book = typeof accountBookTable.$inferSelect;
