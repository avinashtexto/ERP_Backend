import { z } from 'zod';

export const loginSchema = z
  .object({
    username: z.string().optional(),
    email: z.string().optional(),
    mobile: z.string().optional(),
    password: z.string().min(1, 'Password is required'),
  })
  .refine((data) => !!(data.username || data.email || data.mobile), {
    message: 'Username, email, or mobile is required',
    path: ['login'],
  })
  .passthrough();

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh Token is required in the request body'),
});

export const logoutSchema = z.object({
  refreshToken: z.string().optional(),
});

export const forgotPasswordValidationSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  answer: z.string().min(1, 'Security answer is required'),
});

export const resetPasswordSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  answer: z.string().min(1, 'Security answer is required'),
  new_password: z.string().min(1, 'New password is required').max(10, 'Password must be at most 10 characters'),
});
