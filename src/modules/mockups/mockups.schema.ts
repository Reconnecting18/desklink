import { z } from 'zod/v4';

export const createMockupSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
});

export const updateMockupSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
});

export const createScreenSchema = z.object({
  name: z.string().min(1).max(100),
  width: z.number().int().min(1).default(375),
  height: z.number().int().min(1).default(812),
  sortOrder: z.number().int().optional(),
  elements: z.any().optional(),
});

export const updateScreenSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  width: z.number().int().min(1).optional(),
  height: z.number().int().min(1).optional(),
  sortOrder: z.number().int().optional(),
  elements: z.any().optional(),
});

export const reorderScreensSchema = z.object({
  screens: z.array(z.object({
    id: z.string().uuid(),
    sortOrder: z.number().int(),
  })),
});

export const createAnnotationSchema = z.object({
  x: z.number(),
  y: z.number(),
  content: z.string().min(1).max(2000),
});

export const updateAnnotationSchema = z.object({
  content: z.string().min(1).max(2000).optional(),
  resolved: z.boolean().optional(),
});

export type CreateMockupInput = z.infer<typeof createMockupSchema>;
export type UpdateMockupInput = z.infer<typeof updateMockupSchema>;
export type CreateScreenInput = z.infer<typeof createScreenSchema>;
export type UpdateScreenInput = z.infer<typeof updateScreenSchema>;
