import { z } from "zod";

const numericId = z
  .string()
  .regex(/^\d+$/, "Must be a numeric ID")
  .or(z.number().int().positive())
  .transform(Number);

export const PersonalWorkFilterDto = z.object({
  from_date: z.string().optional(),
  to_date: z.string().optional(),
  fk_emp_id: numericId.optional(),
  last_status: z.string().optional(),
  own_record: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  page_size: z.coerce.number().int().positive().max(500).default(50),
});
export type PersonalWorkFilterDtoType = z.infer<typeof PersonalWorkFilterDto>;

export const CreatePersonalWorkDto = z.object({
  request_date: z.string().transform((v) => new Date(v)),
  fk_emp_id: numericId,
  leaving_time: z.string().transform((v) => new Date(v)),
  return_time: z.string().transform((v) => new Date(v)),
  break_time: z.coerce.number().int().nonnegative().optional(),
  reason: z.string().min(1, "Reason is required").max(250),
  remarks: z.string().max(250).optional().default(""),
}).refine(
  (data) => data.leaving_time < data.return_time,
  {
    message: "Leaving time must be before return time",
    path: ["leaving_time"],
  }
).refine(
  (data) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const requestDate = new Date(data.request_date);
    requestDate.setHours(0, 0, 0, 0);
    // Request date must be today or future (not past)
    return requestDate >= today;
  },
  {
    message: "Personal work can only be applied for current or future dates",
    path: ["request_date"],
  }
).refine(
  (data) => {
    // Ensure leaving and return times are within the same day as request_date
    const requestDate = new Date(data.request_date);
    requestDate.setHours(0, 0, 0, 0);
    const leavingDate = new Date(data.leaving_time);
    leavingDate.setHours(0, 0, 0, 0);
    const returnDate = new Date(data.return_time);
    returnDate.setHours(0, 0, 0, 0);
    return leavingDate.getTime() === requestDate.getTime() && returnDate.getTime() === requestDate.getTime();
  },
  {
    message: "Leaving and return times must be on the same day as the request date",
    path: ["leaving_time"],
  }
).refine(
  (data) => {
    // Validate that times are within working hours (9:30 AM to 6:30 PM)
    const leavingHour = data.leaving_time.getHours();
    const leavingMinute = data.leaving_time.getMinutes();
    const returnHour = data.return_time.getHours();
    const returnMinute = data.return_time.getMinutes();
    const workingStartHour = 9; // 9 AM
    const workingStartMinute = 30; // 30 minutes
    const workingEndHour = 18; // 6 PM
    const workingEndMinute = 30; // 30 minutes

    const leavingTime = leavingHour * 60 + leavingMinute;
    const returnTime = returnHour * 60 + returnMinute;
    const workingStart = workingStartHour * 60 + workingStartMinute;
    const workingEnd = workingEndHour * 60 + workingEndMinute;

    return leavingTime >= workingStart && returnTime <= workingEnd;
  },
  {
    message: "Personal work time must be within working hours (9:30 AM to 6:30 PM)",
    path: ["leaving_time"],
  }
);
export type CreatePersonalWorkDtoType = z.infer<typeof CreatePersonalWorkDto>;

export const AuthorizePersonalWorkDto = z.object({
  pk_pw_id: numericId,
  authorize: z.boolean(),
  remarks: z.string().max(250).optional().default(""),
});
export type AuthorizePersonalWorkDtoType = z.infer<typeof AuthorizePersonalWorkDto>;
