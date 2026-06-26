import { db } from "@/config/db.config.js";
import { and, between, desc, eq, gte, ilike, lte, ne, or, sql } from "drizzle-orm";
import { sal_loan, sal_loan_schedule, sal_employee, app_user } from "@/shared/database/schemas/index.js";
import type {
  Loan,
  LoanSchedule,
  LoanWithSchedule,
  LoanCalculationResult,
  LoanScheduleCalculation,
  EmployeeOption,
  PaginatedResult,
} from "./loan-request.types.js";
import type {
  CreateLoanDtoType,
  UpdateLoanDtoType,
  LoanFilterDtoType,
  AuthorizeLoanDtoType,
  DeleteLoanDtoType,
  LoanCalculateDtoType,
} from "./loan-request.dto.js";

// ─────────────────────────────────────────────────────────────
// EMI CALCULATION ENGINE
// ─────────────────────────────────────────────────────────────

export function calculateAmortizationSchedule(
  principal: number,
  rate: number,
  installments: number,
  method: string,
  deduct_from_month: string
): LoanCalculationResult {
  const schedule: LoanScheduleCalculation[] = [];
  let total_interest = 0;
  let emi = 0;

  // Helper to add months to YYYY-MM
  const add_months = (start_month_str: string, months_to_add: number): string => {
    const [year_str, month_str] = start_month_str.split("-");
    const year = parseInt(year_str || "0", 10);
    const month = parseInt(month_str || "0", 10) - 1; // 0-indexed month
    const date = new Date(year, month + months_to_add, 1);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    return `${yyyy}-${mm}`;
  };

  if (method === "Equated Monthly Method") {
    // Reducing balance EMI (Standard EMI formula)
    const monthly_rate = rate / 12 / 100;
    if (monthly_rate === 0) {
      emi = principal / installments;
    } else {
      emi = (principal * monthly_rate * Math.pow(1 + monthly_rate, installments)) / (Math.pow(1 + monthly_rate, installments) - 1);
    }

    let remaining_balance = principal;
    for (let i = 1; i <= installments; i++) {
      const month = add_months(deduct_from_month, i - 1);
      let interest = remaining_balance * monthly_rate;
      let principal_repaid = emi - interest;

      if (i === installments || remaining_balance < principal_repaid) {
        principal_repaid = remaining_balance;
        interest = emi - principal_repaid;
        if (interest < 0) interest = 0;
        remaining_balance = 0;
      } else {
        remaining_balance -= principal_repaid;
      }

      total_interest += interest;

      schedule.push({
        inst_no: i,
        inst_month: month,
        principal_amount: principal_repaid.toFixed(2),
        interest_amount: interest.toFixed(2),
        add_interest_amount: "0.00",
        total_payable: (principal_repaid + interest).toFixed(2),
        bal_principal: remaining_balance.toFixed(2),
      });
    }
  } else if (method === "Interest Calculation") {
    // Flat Rate
    const total_int = (principal * (rate / 100) * installments) / 12;
    total_interest = total_int;
    const total_payable = principal + total_int;
    emi = total_payable / installments;

    const monthly_interest = total_int / installments;
    const monthly_principal = principal / installments;
    let remaining_balance = principal;

    for (let i = 1; i <= installments; i++) {
      const month = add_months(deduct_from_month, i - 1);
      remaining_balance = Math.max(0, remaining_balance - monthly_principal);
      
      schedule.push({
        inst_no: i,
        inst_month: month,
        principal_amount: monthly_principal.toFixed(2),
        interest_amount: monthly_interest.toFixed(2),
        add_interest_amount: "0.00",
        total_payable: emi.toFixed(2),
        bal_principal: remaining_balance.toFixed(2),
      });
    }
  } else {
    // Remaining Balance Calculation (reducing interest, flat principal repayment)
    const monthly_principal = principal / installments;
    const monthly_rate = rate / 12 / 100;
    let remaining_balance = principal;

    for (let i = 1; i <= installments; i++) {
      const month = add_months(deduct_from_month, i - 1);
      const interest = remaining_balance * monthly_rate;
      let principal_repaid = monthly_principal;

      if (i === installments) {
        principal_repaid = remaining_balance;
        remaining_balance = 0;
      } else {
        remaining_balance -= principal_repaid;
      }

      total_interest += interest;
      const total_payable = principal_repaid + interest;

      schedule.push({
        inst_no: i,
        inst_month: month,
        principal_amount: principal_repaid.toFixed(2),
        interest_amount: interest.toFixed(2),
        add_interest_amount: "0.00",
        total_payable: total_payable.toFixed(2),
        bal_principal: remaining_balance.toFixed(2),
      });
    }

    // EMI is variable, we return average monthly payment
    emi = (principal + total_interest) / installments;
  }

  const total_payable_amount = principal + total_interest;

  return {
    principal_amount: principal.toFixed(2),
    interest_amount: total_interest.toFixed(2),
    add_interest_amount: "0.00",
    total_interest: total_interest.toFixed(2),
    monthly_emi: emi.toFixed(2),
    total_payable_amount: total_payable_amount.toFixed(2),
    balance_principal: principal.toFixed(2),
    schedule,
  };
}

// Helper to compile filter conditions
function buildWhereConditions(filter: LoanFilterDtoType) {
  const conditions = [];

  if (filter.from_loan_date && filter.to_loan_date) {
    conditions.push(between(sal_loan.loan_date, filter.from_loan_date, filter.to_loan_date));
  }

  if (filter.fk_emp_id) {
    conditions.push(eq(sal_loan.fk_emp_id, filter.fk_emp_id));
  }

  if (filter.employee) {
    conditions.push(ilike(sal_employee.employee, `${filter.employee}%`));
  }

  if (filter.loan_no) {
    conditions.push(ilike(sal_loan.loan_no, `${filter.loan_no}%`));
  }

  if (filter.loan_type) {
    conditions.push(eq(sal_loan.loan_type, filter.loan_type));
  }

  if (filter.last_status) {
    conditions.push(ilike(sal_loan.last_status, `${filter.last_status}%`));
  }

  if (filter.own_record) {
    if (filter.fk_set_id) {
      conditions.push(eq(sal_loan.fk_user_id, Number(filter.fk_set_id)));
    } else if (filter.fk_emp_id) {
      conditions.push(eq(sal_loan.fk_emp_id, filter.fk_emp_id));
    }
  }

  return conditions;
}

// ─────────────────────────────────────────────────────────────
// CRUD & TRANSACTIONS
// ─────────────────────────────────────────────────────────────

/**
 * Fetch paginated list of loans
 */
export async function getLoans(
  filter: LoanFilterDtoType
): Promise<PaginatedResult<Loan>> {
  const conditions = buildWhereConditions(filter);
  const offset = (filter.page - 1) * filter.page_size;

  const [rows, count_result] = await Promise.all([
    db
      .select({
        pk_loan_id: sal_loan.pk_loan_id,
        loan_no: sal_loan.loan_no,
        loan_date: sal_loan.loan_date,
        fk_emp_id: sal_loan.fk_emp_id,
        loan_type: sal_loan.loan_type,
        loan_amount: sal_loan.loan_amount,
        voucher_no: sal_loan.voucher_no,
        interest_rate: sal_loan.interest_rate,
        installments: sal_loan.installments,
        return_through: sal_loan.return_through,
        deduct_from_month: sal_loan.deduct_from_month,
        calc_method: sal_loan.calc_method,
        remarks: sal_loan.remarks,
        date_timestamp: sal_loan.date_timestamp,
        last_status: sal_loan.last_status,
        authorize: sal_loan.authorize,
        a_timestamp: sal_loan.a_timestamp,
        accepted: sal_loan.accepted,
        a_remarks: sal_loan.a_remarks,
        employee_name: sal_employee.employee,
      })
      .from(sal_loan)
      .innerJoin(sal_employee, eq(sal_employee.pk_emp_id, sal_loan.fk_emp_id))
      .where(and(...conditions))
      .orderBy(desc(sal_loan.loan_date))
      .limit(filter.page_size)
      .offset(offset),

    db
      .select({ count: sql<number>`count(*)::int` })
      .from(sal_loan)
      .innerJoin(sal_employee, eq(sal_employee.pk_emp_id, sal_loan.fk_emp_id))
      .where(and(...conditions)),
  ]);

  const total = count_result[0]?.count ?? 0;

  return {
    data: rows as any[],
    meta: {
      page: filter.page,
      page_size: filter.page_size,
      total,
      total_pages: Math.ceil(total / filter.page_size),
    },
  };
}

/**
 * Fetch a single loan request with its amortization schedule
 */
export async function getLoanById(
  pk_loan_id: number
): Promise<LoanWithSchedule | null> {
  const [header] = await db
    .select()
    .from(sal_loan)
    .where(eq(sal_loan.pk_loan_id, pk_loan_id))
    .limit(1);

  if (!header) return null;

  const schedule = await db
    .select()
    .from(sal_loan_schedule)
    .where(eq(sal_loan_schedule.fk_loan_id, pk_loan_id))
    .orderBy(sal_loan_schedule.inst_no);

  const [emp] = await db
    .select({ employee: sal_employee.employee })
    .from(sal_employee)
    .where(eq(sal_employee.pk_emp_id, header.fk_emp_id))
    .limit(1);

  return {
    ...header,
    schedule: schedule as LoanSchedule[],
    employee_name: emp?.employee ?? null,
  };
}

/**
 * Create a new loan request and generate its schedule
 */
export async function createLoan(
  dto: CreateLoanDtoType,
  fk_user_id: number
): Promise<number> {
  return await db.transaction(async (tx) => {
    // 1. Check duplicate loan_no
    const [existing] = await tx
      .select({ pk_loan_id: sal_loan.pk_loan_id })
      .from(sal_loan)
      .where(eq(sal_loan.loan_no, dto.loan_no))
      .limit(1);

    if (existing) {
      throw new Error(`Loan Transaction No. ${dto.loan_no} already exists.`);
    }

    // 2. Save header record and return generated ID
    const [inserted] = await tx.insert(sal_loan).values({
      loan_no: dto.loan_no,
      loan_date: dto.loan_date,
      fk_emp_id: dto.fk_emp_id,
      loan_type: dto.loan_type,
      loan_amount: String(dto.loan_amount),
      voucher_no: dto.voucher_no,
      interest_rate: String(dto.interest_rate),
      installments: dto.installments,
      return_through: dto.return_through,
      deduct_from_month: dto.deduct_from_month,
      calc_method: dto.calc_method,
      remarks: dto.remarks,
      date_timestamp: new Date(),
      fk_user_id,
      last_status: "Added",
      authorize: false,
    }).returning({ pk_loan_id: sal_loan.pk_loan_id });

    if (!inserted) {
      throw new Error("Failed to create loan request");
    }
    const pk_loan_id = inserted.pk_loan_id;

    // 3. Calculate schedule lines and save them
    const calculation = calculateAmortizationSchedule(
      dto.loan_amount,
      dto.interest_rate,
      dto.installments,
      dto.calc_method,
      dto.deduct_from_month
    );

    if (calculation.schedule.length > 0) {
      const schedule_inserts = calculation.schedule.map((inst) => {
        return {
          fk_loan_id: pk_loan_id,
          inst_no: inst.inst_no,
          inst_month: inst.inst_month,
          principal_amount: inst.principal_amount,
          interest_amount: inst.interest_amount,
          add_interest_amount: "0.00",
          total_payable: inst.total_payable,
          bal_principal: inst.bal_principal,
          status: "Pending",
        };
      });

      await tx.insert(sal_loan_schedule).values(schedule_inserts);
    }

    return pk_loan_id;
  });
}

/**
 * Update an existing loan request and rebuild its schedule
 */
export async function updateLoan(
  dto: UpdateLoanDtoType,
  fk_user_id: number
): Promise<void> {
  await db.transaction(async (tx) => {
    const pk_loan_id = dto.pk_loan_id;

    // 1. Fetch current loan details to merge partial values
    const [current] = await tx
      .select()
      .from(sal_loan)
      .where(eq(sal_loan.pk_loan_id, pk_loan_id))
      .limit(1);

    if (!current) {
      throw new Error(`Loan record with ID ${pk_loan_id} not found.`);
    }

    // Check duplicate loan_no
    if (dto.loan_no) {
      const [dup] = await tx
        .select({ pk_loan_id: sal_loan.pk_loan_id })
        .from(sal_loan)
        .where(
          and(
            eq(sal_loan.loan_no, dto.loan_no),
            ne(sal_loan.pk_loan_id, pk_loan_id)
          )
        )
        .limit(1);
      if (dup) throw new Error(`Loan Transaction No. ${dto.loan_no} already exists.`);
    }

    // Merge changes
    const merged = {
      loan_no: dto.loan_no ?? current.loan_no,
      loan_date: dto.loan_date ?? current.loan_date,
      fk_emp_id: dto.fk_emp_id ?? current.fk_emp_id,
      loan_type: dto.loan_type ?? current.loan_type,
      loan_amount: dto.loan_amount !== undefined ? String(dto.loan_amount) : current.loan_amount,
      voucher_no: dto.voucher_no !== undefined ? dto.voucher_no : current.voucher_no,
      interest_rate: dto.interest_rate !== undefined ? String(dto.interest_rate) : current.interest_rate,
      installments: dto.installments ?? current.installments,
      return_through: dto.return_through ?? current.return_through,
      deduct_from_month: dto.deduct_from_month ?? current.deduct_from_month,
      calc_method: dto.calc_method ?? current.calc_method,
      remarks: dto.remarks !== undefined ? dto.remarks : current.remarks,
    };

    // 2. Update header
    await tx
      .update(sal_loan)
      .set({
        ...merged,
        last_status: "Edited",
        date_timestamp: new Date(),
        fk_user_id,
        authorize: false,
        a_timestamp: null,
        fk_a_user_id: null,
        accepted: "",
        a_remarks: "",
      })
      .where(eq(sal_loan.pk_loan_id, pk_loan_id));

    // 3. Clear existing schedule
    await tx
      .delete(sal_loan_schedule)
      .where(eq(sal_loan_schedule.fk_loan_id, pk_loan_id));

    // 4. Regenerate schedule
    const calculation = calculateAmortizationSchedule(
      parseFloat(merged.loan_amount),
      parseFloat(merged.interest_rate || "0"),
      merged.installments,
      merged.calc_method,
      merged.deduct_from_month
    );

    if (calculation.schedule.length > 0) {
      const schedule_inserts = calculation.schedule.map((inst) => {
        return {
          fk_loan_id: pk_loan_id,
          inst_no: inst.inst_no,
          inst_month: inst.inst_month,
          principal_amount: inst.principal_amount,
          interest_amount: inst.interest_amount,
          add_interest_amount: "0.00",
          total_payable: inst.total_payable,
          bal_principal: inst.bal_principal,
          status: "Pending",
        };
      });

      await tx.insert(sal_loan_schedule).values(schedule_inserts);
    }
  });
}

/**
 * Delete a loan request
 */
export async function deleteLoan(
  dto: DeleteLoanDtoType
): Promise<void> {
  await db.transaction(async (tx) => {
    const pk_loan_id = dto.pk_loan_id;

    // Schedule cascade deletes via FK references constraint, but let's explicitly clear for safety
    await tx
      .delete(sal_loan_schedule)
      .where(eq(sal_loan_schedule.fk_loan_id, pk_loan_id));

    await tx
      .delete(sal_loan)
      .where(eq(sal_loan.pk_loan_id, pk_loan_id));
  });
}

/**
 * Authorize or Reject a loan request
 */
export async function authorizeLoan(
  dto: AuthorizeLoanDtoType
): Promise<void> {
  await db
    .update(sal_loan)
    .set({
      authorize: dto.accepted === "Accept",
      a_timestamp: new Date(),
      fk_a_user_id: dto.fk_a_user_id,
      accepted: dto.accepted,
      a_remarks: dto.a_remarks,
      last_status: dto.accepted === "Accept" ? "Authorized" : "Rejected",
    })
    .where(eq(sal_loan.pk_loan_id, dto.pk_loan_id));
}

/**
 * Fetch employee options for dropdown
 */
export async function getEmployeeOptions(): Promise<EmployeeOption[]> {
  const rows = await db
    .select({
      pk_emp_id: sal_employee.pk_emp_id,
      emp_code: sal_employee.emp_code,
      contact_name: sal_employee.employee,
      fk_set_id: sal_employee.fk_set_id,
      doj: sal_employee.doj,
    })
    .from(sal_employee)
    .orderBy(sal_employee.employee);

  // Cast output types
  return rows.map((r) => ({
    pk_emp_id: r.pk_emp_id || 0,
    emp_code: r.emp_code || "",
    contact_name: r.contact_name || "",
    department: null,
    designation: null,
    fk_set_id: r.fk_set_id !== null ? String(r.fk_set_id) : null,
    doj: r.doj ? new Date(r.doj) : new Date(),
  }));
}
