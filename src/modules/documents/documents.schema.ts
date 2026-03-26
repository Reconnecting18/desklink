import { z } from 'zod/v4';

export const createDocumentSchema = z.object({
  title: z.string().min(1).max(200),
  type: z.enum(['DOCUMENT', 'SPREADSHEET', 'PRESENTATION']),
  content: z.record(z.string(), z.any()).optional(),
});

export const updateDocumentSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.record(z.string(), z.any()).optional(),
});

export const listDocumentsQuery = z.object({
  type: z.enum(['DOCUMENT', 'SPREADSHEET', 'PRESENTATION']).optional(),
});

export const addCollaboratorSchema = z.object({
  userId: z.string().uuid(),
  permission: z.enum(['view', 'edit']).default('edit'),
});

export const exportQuery = z.object({
  format: z.enum(['json', 'html']).default('json'),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
