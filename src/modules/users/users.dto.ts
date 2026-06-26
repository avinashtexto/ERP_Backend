// ─────────────────────────────────────────────
//  users.dto.ts
//  Request body shapes + express-validator rules
// ─────────────────────────────────────────────

import { body, query, param } from 'express-validator';

// ── Create User DTO ──────────────────────────
export interface CreateUserDto {
  username: string;
  password: string;
  mobile?: string | null;
  fk_ec_id?: number | null;
  fk_emp_id?: number | null;
  answer?: string | null;
}

// ── Update User DTO ──────────────────────────
export interface UpdateUserDto {
  username?: string;
  password?: string;
  fk_emp_id?: number | null;
  fk_ec_id?: number | null;
  answer?: string | null;
  mobile?: string | null;
  security_question_id?: number | null;
  security_question?: string | null;
}

// ── Validation rule chains ───────────────────

export const createUserValidation = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required.')
    .isLength({ max: 15 })
    .withMessage('Username must be at most 15 characters.'),

  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required.')
    .isLength({ max: 10 })
    .withMessage('Password must be at most 10 characters.'),

  body('mobile')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage('Mobile must be at most 50 characters.'),

  body('fk_ec_id')
    .optional({ nullable: true })
    .isNumeric()
    .withMessage('Email configuration ID must be a numeric value.'),

  body('fk_emp_id')
    .optional({ nullable: true })
    .isNumeric()
    .withMessage('Employee ID must be a numeric value.'),

  body('answer')
    .trim()
    .notEmpty()
    .withMessage('Answer is required.')
    .isLength({ max: 50 })
    .withMessage('Answer must be at most 50 characters.'),

  body('security_question_id')
    .notEmpty()
    .withMessage('Security question ID is required.')
    .isNumeric()
    .withMessage('Security question ID must be a numeric value.'),

  body('security_question')
    .trim()
    .notEmpty()
    .withMessage('Security question is required.')
    .isLength({ max: 200 })
    .withMessage('Security question must be at most 200 characters.'),
];

export const updateUserValidation = [
  param('id').notEmpty().withMessage('User ID is required.'),

  body('username')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Username cannot be empty.')
    .isLength({ max: 15 })
    .withMessage('Username must be at most 15 characters.'),

  body('password')
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage('Password must be at most 10 characters.'),

  body('fk_emp_id')
    .optional({ nullable: true })
    .isNumeric()
    .withMessage('Employee ID must be a numeric value.'),

  body('fk_ec_id')
    .optional({ nullable: true })
    .isNumeric()
    .withMessage('Email configuration ID must be a numeric value.'),

  body('answer')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage('Answer must be at most 50 characters.'),

  body('mobile')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage('Mobile must be at most 50 characters.'),

  body('security_question_id')
    .optional({ nullable: true })
    .isNumeric()
    .withMessage('Security question ID must be a numeric value.'),

  body('security_question')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 200 })
    .withMessage('Security question must be at most 200 characters.'),
];

export const userFilterValidation = [
  query('username').optional().trim().isString(),
  query('employee').optional().trim().isString(),
  query('creator').optional().trim().isString(),
  query('last_status').optional().trim().isString(),
  query('date_time_stamp').optional().trim().isISO8601().withMessage('Invalid date format.'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.'),
  query('pageSize')
    .optional()
    .isInt({ min: 1, max: 500 })
    .withMessage('Page size must be between 1 and 500.'),
];

export const registerDeviceTokenValidation = [
  body('device_token')
    .trim()
    .notEmpty()
    .withMessage('Device token is required.'),
  body('device_type')
    .optional({ nullable: true })
    .trim()
    .isString()
    .withMessage('Device type must be a string.'),
];

