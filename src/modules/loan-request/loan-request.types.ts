export interface Loan {
  pk_loan_id: number;
  loan_no: string;
  loan_date: string;
  fk_emp_id: number;
  loan_type: string;
  loan_amount: string;
  voucher_no: string | null;
  interest_rate: string | null;
  installments: number;
  return_through: string;
  deduct_from_month: string;
  calc_method: string;
  remarks: string | null;
  date_timestamp?: Date | null;
  fk_user_id?: number | null;
  last_status?: string | null;
  authorize?: boolean | null;
  a_timestamp?: Date | null;
  fk_a_user_id?: number | null;
  accepted?: string | null;
  a_remarks?: string | null;
}

export interface LoanSchedule {
  pk_schedule_id: number;
  fk_loan_id: number;
  inst_no: number;
  inst_month: string;
  principal_amount: string;
  interest_amount: string;
  add_interest_amount: string | null;
  total_payable: string;
  bal_principal: string;
  status: string | null;
}

export interface LoanWithSchedule extends Loan {
  schedule: LoanSchedule[];
  employee_name?: string | null;
}

export interface LoanScheduleCalculation {
  inst_no: number;
  inst_month: string;
  principal_amount: string;
  interest_amount: string;
  add_interest_amount: string;
  total_payable: string;
  bal_principal: string;
}

export interface LoanCalculationResult {
  principal_amount: string;
  interest_amount: string;
  add_interest_amount: string;
  total_interest: string;
  monthly_emi: string;
  total_payable_amount: string;
  balance_principal: string;
  schedule: LoanScheduleCalculation[];
}

export interface EmployeeOption {
  pk_emp_id: number;
  emp_code: string;
  contact_name: string;
  department: string | null;
  designation: string | null;
  fk_set_id: string | null;
  doj: Date;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}
