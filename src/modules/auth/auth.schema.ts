import { z } from 'zod/v4';

export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(128),
  displayName: z.string().min(1).max(100),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export const refreshSchema = z.object({
  refreshToken: z.string(),
});

export const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
