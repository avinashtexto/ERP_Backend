import type { Request, Response, NextFunction } from 'express';
import * as service from './loan-request.service.js';
import {
  CreateLoanDto,
  UpdateLoanDto,
  LoanFilterDto,
  AuthorizeLoanDto,
  DeleteLoanDto,
  LoanCalculateDto,
  IdParamDto
} from './loan-request.dto.js';
import { db } from "../../config/db.config.js";
import { salEmployee } from "../../shared/database/schemas/index.js";
import { eq } from "drizzle-orm";
import { generateReportPDF } from "../../shared/utils/pdf-generator.js";

/**
 * List loans (paginated + filtered)
 */
export async function listLoans(req: Request, res: Response): Promise<void> {
  try {
    const parsed = LoanFilterDto.safeParse(req.query);
    if (!parsed.success) {
      res.build
        .withStatus(400)
        .withError('INVALID_INPUT', parsed.error.message)
        .fail()
        .send();
      return;
    }

    const result = await service.getLoans(parsed.data);
    res.build
      .withStatus(200)
      .withModule('loan-request')
      .withMessage('Loans list retrieved successfully')
      .withData(result)
      .success()
      .send();
  } catch (error: any) {
    res.build
      .withStatus(500)
      .withError('FETCH_FAILED', error.message)
      .fail()
      .send();
  }
}

/**
 * Get single loan details + schedule
 */
export async function getLoan(req: Request, res: Response): Promise<void> {
  try {
    const id_parsed = IdParamDto.safeParse(req.params);
    if (!id_parsed.success) {
      res.build
        .withStatus(400)
        .withError('INVALID_ID', 'Invalid loan ID')
        .fail()
        .send();
      return;
    }

    const record = await service.getLoanById(id_parsed.data.id);
    if (!record) {
      res.build
        .withStatus(404)
        .withError('NOT_FOUND', 'Loan request not found')
        .fail()
        .send();
      return;
    }

    res.build
      .withStatus(200)
      .withModule('loan-request')
      .withMessage('Loan details retrieved successfully')
      .withData(record)
      .success()
      .send();
  } catch (error: any) {
    res.build
      .withStatus(500)
      .withError('FETCH_FAILED', error.message)
      .fail()
      .send();
  }
}

/**
 * Create a new loan request
 */
export async function createLoan(req: Request, res: Response): Promise<void> {
  try {
    const parsed = CreateLoanDto.safeParse(req.body);
    if (!parsed.success) {
      res.build
        .withStatus(400)
        .withError('INVALID_INPUT', parsed.error.message)
        .fail()
        .send();
      return;
    }

    const fk_user_id = Number(((req as any).user?.id || (req as any).user?.pk_user_id) ?? 1);
    const pk_loan_id = await service.createLoan(parsed.data, fk_user_id);
    
    res.build
      .withStatus(201)
      .withModule('loan-request')
      .withMessage('Loan request submitted successfully')
      .withData({ pk_loan_id })
      .success()
      .send();
  } catch (error: any) {
    if (error.message?.includes('already exists')) {
      res.build
        .withStatus(409)
        .withError('CONFLICT', error.message)
        .fail()
        .send();
      return;
    }
    res.build
      .withStatus(500)
      .withError('CREATE_FAILED', error.message)
      .fail()
      .send();
  }
}

/**
 * Update a loan request
 */
export async function updateLoan(req: Request, res: Response): Promise<void> {
  try {
    const id_parsed = IdParamDto.safeParse(req.params);
    if (!id_parsed.success) {
      res.build
        .withStatus(400)
        .withError('INVALID_ID', 'Invalid loan ID')
        .fail()
        .send();
      return;
    }

    const parsed = UpdateLoanDto.safeParse({
      ...req.body,
      pk_loan_id: id_parsed.data.id,
    });
    if (!parsed.success) {
      res.build
        .withStatus(400)
        .withError('INVALID_INPUT', parsed.error.message)
        .fail()
        .send();
      return;
    }

    const fk_user_id = Number(((req as any).user?.id || (req as any).user?.pk_user_id) ?? 1);
    await service.updateLoan(parsed.data, fk_user_id);

    res.build
      .withStatus(200)
      .withModule('loan-request')
      .withMessage('Loan request updated successfully')
      .withData({ updated: true })
      .success()
      .send();
  } catch (error: any) {
    if (error.message?.includes('already exists')) {
      res.build
        .withStatus(409)
        .withError('CONFLICT', error.message)
        .fail()
        .send();
      return;
    }
    res.build
      .withStatus(500)
      .withError('UPDATE_FAILED', error.message)
      .fail()
      .send();
  }
}

/**
 * Delete a loan request
 */
export async function deleteLoan(req: Request, res: Response): Promise<void> {
  try {
    const id_parsed = IdParamDto.safeParse(req.params);
    if (!id_parsed.success) {
      res.build
        .withStatus(400)
        .withError('INVALID_ID', 'Invalid loan ID')
        .fail()
        .send();
      return;
    }

    const fk_user_id = Number(((req as any).user?.id || (req as any).user?.pk_user_id) ?? 1);
    const parsed = DeleteLoanDto.safeParse({
      pk_loan_id: id_parsed.data.id,
      fk_user_id,
    });
    if (!parsed.success) {
      res.build
        .withStatus(400)
        .withError('INVALID_INPUT', parsed.error.message)
        .fail()
        .send();
      return;
    }

    await service.deleteLoan(parsed.data);
    res.build
      .withStatus(200)
      .withModule('loan-request')
      .withMessage('Loan request deleted successfully')
      .withData({ deleted: true })
      .success()
      .send();
  } catch (error: any) {
    res.build
      .withStatus(500)
      .withError('DELETE_FAILED', error.message)
      .fail()
      .send();
  }
}

/**
 * Authorize or reject a loan request
 */
export async function authorizeLoan(req: Request, res: Response): Promise<void> {
  try {
    const id_parsed = IdParamDto.safeParse(req.params);
    if (!id_parsed.success) {
      res.build
        .withStatus(400)
        .withError('INVALID_ID', 'Invalid loan ID')
        .fail()
        .send();
      return;
    }

    const fk_a_user_id = Number(((req as any).user?.id || (req as any).user?.pk_user_id) ?? 1);
    const parsed = AuthorizeLoanDto.safeParse({
      ...req.body,
      pk_loan_id: id_parsed.data.id,
      fk_a_user_id,
    });
    if (!parsed.success) {
      res.build
        .withStatus(400)
        .withError('INVALID_INPUT', parsed.error.message)
        .fail()
        .send();
      return;
    }

    await service.authorizeLoan(parsed.data);
    res.build
      .withStatus(200)
      .withModule('loan-request')
      .withMessage(parsed.data.accepted === 'Accept' ? 'Loan request authorized' : 'Loan request rejected')
      .withData({ authorized: true })
      .success()
      .send();
  } catch (error: any) {
    res.build
      .withStatus(500)
      .withError('AUTHORIZE_FAILED', error.message)
      .fail()
      .send();
  }
}

/**
 * Generate preview of EMI schedule without saving
 */
export async function calculateEMI(req: Request, res: Response): Promise<void> {
  try {
    const parsed = LoanCalculateDto.safeParse(req.body);
    if (!parsed.success) {
      res.build
        .withStatus(400)
        .withError('INVALID_INPUT', parsed.error.message)
        .fail()
        .send();
      return;
    }

    const result = service.calculateAmortizationSchedule(
      parsed.data.loan_amount,
      parsed.data.interest_rate,
      parsed.data.installments,
      parsed.data.calc_method,
      parsed.data.deduct_from_month
    );

    res.build
      .withStatus(200)
      .withModule('loan-request')
      .withMessage('EMI schedule calculated successfully')
      .withData(result)
      .success()
      .send();
  } catch (error: any) {
    res.build
      .withStatus(500)
      .withError('CALCULATION_FAILED', error.message)
      .fail()
      .send();
  }
}

/**
 * Fetch employee options for dropdown
 */
export async function getEmployees(req: Request, res: Response): Promise<void> {
  try {
    const employees = await service.getEmployeeOptions();
    res.build
      .withStatus(200)
      .withModule('loan-request')
      .withMessage('Employees list retrieved successfully')
      .withData(employees)
      .success()
      .send();
  } catch (error: any) {
    res.build
      .withStatus(500)
      .withError('FETCH_FAILED', error.message)
      .fail()
      .send();
  }
}

export async function getLoanReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const requested_emp_code = req.query.fk_emp_id ? String(req.query.fk_emp_id) : '';
    if (!requested_emp_code) {
      res.status(400).json({ success: false, message: 'Employee identification parameter is required' });
      return;
    }

    const parsed = LoanFilterDto.safeParse({
      ...req.query,
      page: 1,
      page_size: 500,
    });
    if (!parsed.success) {
      res.status(400).json({ success: false, message: parsed.error.message });
      return;
    }

    const [emp] = await db
      .select({ employee: salEmployee.employee, emp_code: salEmployee.emp_code })
      .from(salEmployee)
      .where(eq(salEmployee.pk_emp_id, Number(requested_emp_code)))
      .limit(1);

    const emp_name = emp?.employee || 'Employee';
    const emp_code = emp?.emp_code || requested_emp_code;

    const result = await service.getLoans(parsed.data);

    const columns = [
      { header: 'Loan No.', width: 110, key: 'loan_no' },
      { header: 'Date', width: 90, key: 'loan_date' },
      { header: 'Type', width: 100, key: 'loan_type' },
      { header: 'Amount', width: 90, key: 'loan_amount', align: 'right' as const },
      { header: 'ROI (%)', width: 50, key: 'interest_rate', align: 'center' as const },
      { header: 'Tenor (M)', width: 50, key: 'installments', align: 'center' as const },
      { header: 'Status', width: 70, key: 'last_status' },
    ];

    const format_date = (date_val?: string | Date) => {
      if (!date_val) return '';
      try {
        const d = new Date(date_val);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      } catch {
        return String(date_val);
      }
    };

    const rows = result.data.map((item) => ({
      loan_no: item.loan_no,
      loan_date: format_date(item.loan_date),
      loan_type: item.loan_type,
      loan_amount: Number(item.loan_amount).toFixed(2),
      interest_rate: item.interest_rate,
      installments: item.installments,
      last_status: item.last_status,
    }));

    const pdf_buffer = await generateReportPDF(
      'Loan History Report',
      { name: emp_name, code: emp_code },
      columns,
      rows
    );

    const current_month = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=loan_report_${current_month.replace(' ', '_')}.pdf`);
    res.send(pdf_buffer);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getLoanReportById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, message: 'Loan request ID is required' });
      return;
    }

    const loan_id = Array.isArray(id) ? id[0] : id;
    if (!loan_id) {
      res.status(400).json({ success: false, message: 'Loan request ID is required' });
      return;
    }
    const result = await service.getLoanById(Number(loan_id));
    if (!result) {
      res.status(404).json({ success: false, message: 'Loan request not found' });
      return;
    }

    const [emp] = await db
      .select({ employee: salEmployee.employee, emp_code: salEmployee.emp_code })
      .from(salEmployee)
      .where(eq(salEmployee.pk_emp_id, Number(result.fk_emp_id)))
      .limit(1);

    const emp_name = emp?.employee || 'Employee';
    const emp_code = emp?.emp_code || String(result.fk_emp_id);

    const columns = [
      { header: 'Field', width: 120, key: 'field' },
      { header: 'Value', width: 200, key: 'value' },
    ];

    const format_date = (date_val?: string | Date) => {
      if (!date_val) return '';
      try {
        const d = new Date(date_val);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      } catch {
        return String(date_val);
      }
    };

    const rows = [
      { field: 'Loan No.', value: result.loan_no },
      { field: 'Loan Date', value: format_date(result.loan_date) },
      { field: 'Loan Type', value: result.loan_type },
      { field: 'Loan Amount', value: Number(result.loan_amount).toFixed(2) },
      { field: 'Interest Rate', value: result.interest_rate },
      { field: 'Installments', value: result.installments },
      { field: 'Status', value: result.last_status },
      { field: 'Remarks', value: result.remarks || '' },
    ];

    const pdf_buffer = await generateReportPDF(
      'Loan Request Report',
      { name: emp_name, code: emp_code },
      columns,
      rows
    );

    const current_month = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=loan_request_${id}_${current_month.replace(' ', '_')}.pdf`);
    res.send(pdf_buffer);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
