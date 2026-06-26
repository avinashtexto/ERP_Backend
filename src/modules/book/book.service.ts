import bcrypt from 'bcrypt';
import { eq, or, sql } from 'drizzle-orm';

import type { BookBaseInput } from './book.dto.js';
import type { Book } from './book.types.js';

import { commonDb } from '@/config/db.config.js';
import {
  accountBookTable,
  activeServerTable,
} from '@/shared/database/schemas/account-book.schema.js';
import { cacheManager } from '@/shared/utils/cache.manager.js';

export async function getBookNames(
  page = 1,
  pageSize = 100,
): Promise<{ data: string[]; total: number; page: number; pageSize: number }> {
  const cacheKey = `books:names:${page}:${pageSize}`;
  const cached = cacheManager.get<{
    data: string[];
    total: number;
    page: number;
    pageSize: number;
  }>(cacheKey);
  if (cached) {
    return cached;
  }

  const offset = (page - 1) * pageSize;
  const data = await commonDb
    .select({ book_name: accountBookTable.book_name })
    .from(accountBookTable)
    .limit(pageSize)
    .offset(offset);
  const names = data.map((r) => r.book_name);

  const totalResult = await commonDb
    .select({ count: sql<number>`count(*)` })
    .from(accountBookTable);
  const total = totalResult[0] ? Number(totalResult[0].count) : 0;

  const result = {
    data: names,
    total,
    page,
    pageSize,
  };

  cacheManager.set(cacheKey, result, 60); // cache for 60 seconds
  return result;
}

export async function getAllBooks(
  page = 1,
  pageSize = 100,
): Promise<{ data: Book[]; total: number; page: number; pageSize: number }> {
  const cacheKey = `books:all:${page}:${pageSize}`;
  const cached = cacheManager.get<{ data: Book[]; total: number; page: number; pageSize: number }>(
    cacheKey,
  );
  if (cached) {
    return cached;
  }

  const offset = (page - 1) * pageSize;
  const data = await commonDb.select().from(accountBookTable).limit(pageSize).offset(offset);

  const totalResult = await commonDb
    .select({ count: sql<number>`count(*)` })
    .from(accountBookTable);
  const total = totalResult[0] ? Number(totalResult[0].count) : 0;

  const result = {
    data,
    total,
    page,
    pageSize,
  };

  cacheManager.set(cacheKey, result, 60); // cache for 60 seconds
  return result;
}

export async function health(): Promise<{ status: string }> {
  // Simple health check query on the account_book table in the common database
  await commonDb.select({ id: accountBookTable.pk_book_id }).from(accountBookTable).limit(1);
  return { status: 'UP' };
}

export async function createBook(input: BookBaseInput): Promise<Book> {
  const saltRounds = Number(process.env.BCRYPT_ROUNDS) || 12;
  const hashedPassword = await bcrypt.hash(input.password, saltRounds);
  const resolvedBookName = (
    input.book_name ||
    input.bookname ||
    input.bookName ||
    input.BookName ||
    ''
  ).trim();

  // Derive database name (alphanumeric and underscores only, lowercase, truncated)
  const database_name = resolvedBookName
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 50);

  // Perform inserts in transaction
  const newBook = await commonDb.transaction(async (tx) => {
    // 1. Insert into account_book
    const [insertedBook] = await tx
      .insert(accountBookTable)
      .values({
        book_name: resolvedBookName,
        active: true,
        file_name: '',
        database_name,
        product_id: '1',
        parent_id: '1',
        add_path: 'IERPCom',
        backup_path: '',
      })
      .returning();

    if (!insertedBook) {
      throw new Error('Failed to insert account_book');
    }

    // 2. Insert into active_server
    await tx.insert(activeServerTable).values({
      active_server: 'localhost',
      product_id: 1,
      parent_id: 1,
      user_id: input.username,
      password: hashedPassword,
      fk_book_id: insertedBook.pk_book_id,
    });

    return insertedBook;
  });

  // Invalidate caches
  cacheManager.delete('books:all');
  cacheManager.delete('books:names');
  cacheManager.delete(`book:${resolvedBookName}:${input.username}`);
  cacheManager.delete(`book:${database_name}:${input.username}`);

  return newBook;
}
