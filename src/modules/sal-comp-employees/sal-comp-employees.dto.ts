import { z } from 'zod';

export const COMPLAINT_TYPES = ['complaint', 'suggestion', 'feedback', 'appraisal'] as const;
export type ComplaintType = typeof COMPLAINT_TYPES[number];

export const create_complaint_dto = z.object({
  pk_com_id: z.coerce.number().int().positive('Complaint ID must be a positive integer'),
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().trim().max(2000).optional(),
  type: z.enum(COMPLAINT_TYPES).default('complaint'),
  employee_ids: z.array(z.number().int().positive()).min(1, 'At least one employee must be linked'),
  attachments: z.array(
    z.object({
      file_name: z.string().trim().min(1, 'File name is required').max(255),
      file_path: z.string().trim().min(1, 'File path is required').max(500),
      doc_type: z.string().trim().min(1, 'Doc type is required').max(100),
    })
  ).optional(),
});

export const update_complaint_dto = create_complaint_dto.partial().omit({ pk_com_id: true });

export const list_complaints_dto = z.object({
  page: z.coerce.number().int().positive().default(1),
  page_size: z.coerce.number().int().positive().max(100).default(50),
  title: z.string().trim().optional(),
  type: z.enum(COMPLAINT_TYPES).optional(),
});
