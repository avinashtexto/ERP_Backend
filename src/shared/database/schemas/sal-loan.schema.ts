import { pgTable, varchar, date, boolean, timestamp, numeric, integer, unique, index } from "drizzle-orm/pg-core";

export const sal_loan = pgTable(
  "sal_loan",
  {
    pk_loan_id: integer("pk_loan_id").primaryKey().notNull().generatedByDefaultAsIdentity(),
    loan_no: varchar("loan_no", { length: 20 }).notNull(),
    loan_date: date("loan_date").notNull(),
    fk_emp_id: integer("fk_emp_id").notNull(),
    loan_type: varchar("loan_type", { length: 30 }).notNull(),
    loan_amount: numeric("loan_amount", { precision: 12, scale: 2 }).notNull(),
    voucher_no: varchar("voucher_no", { length: 30 }),
    interest_rate: numeric("interest_rate", { precision: 5, scale: 2 }).default("0.00"),
    installments: integer("installments").notNull(),
    return_through: varchar("return_through", { length: 20 }).notNull(),
    deduct_from_month: varchar("deduct_from_month", { length: 20 }).notNull(),
    calc_method: varchar("calc_method", { length: 50 }).notNull(),
    remarks: varchar("remarks", { length: 200 }),

    // Audit fields
    date_timestamp: timestamp("date_timestamp").defaultNow(),
    fk_user_id: integer("fk_user_id"),
    last_status: varchar("last_status", { length: 30 }).default("Added"),

    // Authorization fields
    authorize: boolean("authorize").default(false),
    a_timestamp: timestamp("a_timestamp"),
    fk_a_user_id: integer("fk_a_user_id"),
    accepted: varchar("accepted", { length: 10 }).default(""),
    a_remarks: varchar("a_remarks", { length: 200 }).default(""),
  },
  (t) => [
    unique("uq_sal_loan_loan_no").on(t.loan_no),
    index("idx_sal_loan_loan_date").on(t.loan_date),
    index("idx_sal_loan_fk_emp_id").on(t.fk_emp_id),
    index("idx_sal_loan_fk_user_id").on(t.fk_user_id),
    index("idx_sal_loan_authorize").on(t.authorize),
  ]
);
