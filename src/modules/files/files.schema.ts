import { z } from 'zod/v4';

export const createFolderSchema = z.object({
  name: z.string().min(1).max(255),
  parentId: z.string().uuid().optional(),
});

export const updateFileSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  parentId: z.string().uuid().nullable().optional(),
});

export const listFilesQuery = z.object({
  parentId: z.string().uuid().optional(),
});

export type CreateFolderInput = z.infer<typeof createFolderSchema>;
export type UpdateFileInput = z.infer<typeof updateFileSchema>;
