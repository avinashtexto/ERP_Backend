import { z } from "zod";

// Shared primitives
const numericId = z.coerce.number().int().positive();

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format");

const deductionMonth = z
  .string()
  .regex(/^\d{4}-\d{2}$/, "Deduction month must be YYYY-MM format");

const positiveAmount = z
  .number()
  .positive("Amount must be greater than zero")
  .or(z.string().regex(/^\d+(\.\d{1,2})?$/, "Amount must be a positive number").transform(Number));

const positiveRate = z
  .number()
  .min(0, "Interest rate cannot be negative")
  .or(z.string().regex(/^\d+(\.\d{1,2})?$/, "Interest rate must be a valid number").transform(Number));

const positiveInteger = z
  .number()
  .int()
  .positive("Installments must be a positive integer")
  .or(z.string().regex(/^\d+$/, "Installments must be an integer").transform(Number));

// Loan Amortisation Calculation Input DTO
export const LoanCalculateDto = z.object({
  loan_amount: positiveAmount,
  interest_rate: positiveRate.default(0),
  installments: positiveInteger,
  calc_method: z.enum([
    "Equated Monthly Method",
    "Interest Calculation",
    "Remaining Balance Calculation"
  ]),
  deduct_from_month: deductionMonth,
});
export type LoanCalculateDtoType = z.infer<typeof LoanCalculateDto>;

// Create Loan Request DTO
export const CreateLoanDto = z.object({
  loan_no: z.string().min(1).max(20),
  loan_date: isoDate,
  fk_emp_id: numericId,
  loan_type: z.string().min(1).max(30),
  loan_amount: positiveAmount,
  voucher_no: z.string().max(30).optional().nullable(),
  interest_rate: positiveRate.default(0),
  installments: positiveInteger,
  return_through: z.enum(["Salary", "Hand"]),
  deduct_from_month: deductionMonth,
  calc_method: z.enum([
    "Equated Monthly Method",
    "Interest Calculation",
    "Remaining Balance Calculation"
  ]),
  remarks: z.string().max(200).optional().nullable(),
});
export type CreateLoanDtoType = z.infer<typeof CreateLoanDto>;

// Update Loan Request DTO
export const UpdateLoanDto = CreateLoanDto.partial().extend({
  pk_loan_id: numericId,
});
export type UpdateLoanDtoType = z.infer<typeof UpdateLoanDto>;

// Loan List Filter DTO
export const LoanFilterDto = z.object({
  from_loan_date: isoDate.optional(),
  to_loan_date: isoDate.optional(),
  fk_emp_id: numericId.optional(),
  employee: z.string().optional(),
  loan_type: z.string().optional(),
  loan_no: z.string().optional(),
  last_status: z.string().optional(),
  own_record: z.coerce.boolean().optional(),
  fk_set_id: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  page_size: z.coerce.number().int().positive().max(500).default(50),
});
export type LoanFilterDtoType = z.infer<typeof LoanFilterDto>;

// Authorize Loan DTO
export const AuthorizeLoanDto = z.object({
  pk_loan_id: numericId,
  accepted: z.enum(["Accept", "Reject"]),
  a_remarks: z.string().max(200).optional().default(""),
  fk_a_user_id: numericId,
});
export type AuthorizeLoanDtoType = z.infer<typeof AuthorizeLoanDto>;

// Delete Loan DTO
export const DeleteLoanDto = z.object({
  pk_loan_id: numericId,
  fk_user_id: numericId,
});
export type DeleteLoanDtoType = z.infer<typeof DeleteLoanDto>;

// Param ID validator
export const IdParamDto = z.object({
  id: numericId,
});
export type IdParamDtoType = z.infer<typeof IdParamDto>;
