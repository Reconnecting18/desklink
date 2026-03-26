import { z } from 'zod/v4';

export const createWhiteboardSchema = z.object({
  title: z.string().min(1).max(200),
});

export const updateWhiteboardSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  thumbnail: z.string().optional(),
});

export const createElementSchema = z.object({
  type: z.enum(['rect', 'ellipse', 'line', 'text', 'freehand', 'image', 'sticky', 'connector']),
  data: z.record(z.string(), z.any()),
  zIndex: z.number().int().optional(),
});

export const updateElementSchema = z.object({
  data: z.record(z.string(), z.any()).optional(),
  zIndex: z.number().int().optional(),
});

export const addCollaboratorSchema = z.object({
  userId: z.string().uuid(),
  permission: z.enum(['view', 'edit']).default('edit'),
});

export type CreateWhiteboardInput = z.infer<typeof createWhiteboardSchema>;
export type UpdateWhiteboardInput = z.infer<typeof updateWhiteboardSchema>;
export type CreateElementInput = z.infer<typeof createElementSchema>;
export type UpdateElementInput = z.infer<typeof updateElementSchema>;
