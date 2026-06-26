import { pgTable, varchar, integer, numeric, index } from "drizzle-orm/pg-core";
import { sal_loan } from './sal-loan.schema.js';

export const sal_loan_schedule = pgTable(
  "sal_loan_schedule",
  {
    pk_schedule_id: integer("pk_schedule_id").primaryKey().notNull().generatedByDefaultAsIdentity(),
    fk_loan_id: integer("fk_loan_id")
      .notNull()
      .references(() => sal_loan.pk_loan_id, { onDelete: "cascade" }),
    inst_no: integer("inst_no").notNull(),
    inst_month: varchar("inst_month", { length: 20 }).notNull(),
    principal_amount: numeric("principal_amount", { precision: 12, scale: 2 }).notNull(),
    interest_amount: numeric("interest_amount", { precision: 12, scale: 2 }).notNull(),
    add_interest_amount: numeric("add_interest_amount", { precision: 12, scale: 2 }).default("0.00"),
    total_payable: numeric("total_payable", { precision: 12, scale: 2 }).notNull(),
    bal_principal: numeric("bal_principal", { precision: 12, scale: 2 }).notNull(),
    status: varchar("status", { length: 20 }).default("Pending"),
  },
  (t) => [
    index("idx_sal_loan_schedule_fk_loan_id").on(t.fk_loan_id),
    index("idx_sal_loan_schedule_inst_month").on(t.inst_month),
  ]
);
