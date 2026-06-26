import { pgTable, varchar, date, boolean, timestamp, unique, index, integer } from 'drizzle-orm/pg-core';

export const sal_leave_request = pgTable(
  'sal_leave_request',
  {
    pk_lr_id: integer('pk_lr_id').primaryKey().notNull().generatedByDefaultAsIdentity(),
    request_no: varchar('request_no', { length: 20 }).notNull(),
    request_date: date('request_date').notNull(),
    from_date: date('from_date').notNull(),
    to_date: date('to_date').notNull(),
    fk_emp_id: integer('fk_emp_id').notNull(),

    // Balances at time of request
    bal_leave: varchar('bal_leave', { length: 20 }).default('0'),
    bal_paid: varchar('bal_paid', { length: 20 }).default('0'),
    bal_sick: varchar('bal_sick', { length: 20 }).default('0'),
    bal_paid_casual: varchar('bal_paid_casual', { length: 20 }).default('0'),
    bal_unpaid_casual: varchar('bal_unpaid_casual', { length: 20 }).default('0'),

    // Leave breakdown applied
    rest_day: varchar('rest_day', { length: 20 }).default('0'),
    unpaid_leave: varchar('unpaid_leave', { length: 20 }).default('0'),
    paid_holiday: varchar('paid_holiday', { length: 20 }).default('0'),
    sick_leave: varchar('sick_leave', { length: 20 }).default('0'),
    paid_casual: varchar('paid_casual', { length: 20 }).default('0'),
    unpaid_casual: varchar('unpaid_casual', { length: 20 }).default('0'),
    maternity: varchar('maternity', { length: 20 }).default('0'),
    paid_leave: varchar('paid_leave', { length: 20 }).default('0'),
    total_leave: varchar('total_leave', { length: 20 }).default('0'),
    absent: varchar('absent', { length: 20 }).default('0'),

    reason: varchar('reason', { length: 100 }),
    remarks: varchar('remarks', { length: 100 }),

    // Audit
    date_timestamp: timestamp('date_timestamp'),
    fk_user_id: integer('fk_user_id'),
    last_status: varchar('last_status', { length: 30 }),

    // Authorization
    authorize: boolean('authorize').default(false),
    a_timestamp: timestamp('a_timestamp'),
    fk_a_user_id: integer('fk_a_user_id'),
    accepted: varchar('accepted', { length: 10 }),
    a_remarks: varchar('a_remarks', { length: 200 }),
  },
  (t) => [
    unique('uq_sal_lr_request_no').on(t.request_no),
    index('idx_sal_lr_request_date').on(t.request_date),
    index('idx_sal_lr_fk_emp_id').on(t.fk_emp_id),
    index('idx_sal_lr_fk_user_id').on(t.fk_user_id),
    index('idx_sal_lr_authorize').on(t.authorize),
  ],
);
