import { pgTable, varchar, integer } from 'drizzle-orm/pg-core';

export const app_questions = pgTable('app_questions', {
  pk_question_id: integer('pk_question_id').primaryKey().generatedByDefaultAsIdentity(),

  questions: varchar('questions', {
    length: 255,
  }).notNull(),
});
