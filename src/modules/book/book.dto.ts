import { z } from 'zod';

export const bookBaseSchema = z
  .object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
    book_name: z.string().optional(),
    bookname: z.string().optional(),
    bookName: z.string().optional(),
    BookName: z.string().optional(),
  })
  .passthrough()
  .refine(
    (data) => {
      const val = data.book_name || data.bookname || data.bookName || data.BookName;
      return !!val && String(val).trim() !== '';
    },
    {
      message: 'Book name is required (use book_name, bookname, bookName, or BookName)',
    },
  );

export type BookBaseInput = z.infer<typeof bookBaseSchema>;
