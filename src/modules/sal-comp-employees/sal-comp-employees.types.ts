import type { SalEmpComplaint, SalCompEmployee, SalCompAttachment } from '@/shared/database/schemas/index.js';

export interface ISalEmpComplaint extends SalEmpComplaint {
  employees?: SalCompEmployee[];
  attachments?: SalCompAttachment[];
}

export type ComplaintType = 'complaint' | 'suggestion' | 'feedback' | 'appraisal';

export interface CreateComplaintRequest {
  pk_com_id: number; // Numeric ID passed from input (complaint primary key)
  title: string;
  description?: string | undefined;
  type?: ComplaintType | undefined;
  employee_ids: number[]; // List of target employee primary keys (fk_emp_id)
  attachments?: {
    file_name: string;
    file_path: string;
    doc_type: string; // e.g. doc, docx, png, pdf, etc.
  }[] | undefined;
}

export interface UpdateComplaintRequest {
  title?: string | undefined;
  description?: string | undefined;
  type?: ComplaintType | undefined;
  employee_ids?: number[] | undefined;
  attachments?: {
    file_name: string;
    file_path: string;
    doc_type: string;
  }[] | undefined;
}

export interface ComplaintDTO {
  pk_com_id: string; // Numeric represented as string in JS
  title: string;
  description: string | null;
  type: string;
  created_at: Date;
  employees: {
    pk_emp_id: number;
    employee: string;
    emp_code: string;
  }[];
  attachments: {
    pk_att_id: number;
    file_name: string;
    file_path: string;
    doc_type: string;
    uploaded_at: Date;
  }[];
}
