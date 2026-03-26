import { z } from 'zod/v4';

export const summarizeSchema = z.object({
  content: z.string().min(1).max(50000),
  contentType: z.enum(['text', 'document', 'tasks']).default('text'),
  maxLength: z.number().int().min(50).max(5000).optional(),
  workspaceId: z.string().uuid().optional(),
});

export const generateSchema = z.object({
  prompt: z.string().min(1).max(10000),
  type: z.enum(['document', 'spreadsheet', 'presentation', 'task', 'email']),
  context: z.record(z.string(), z.any()).optional(),
  workspaceId: z.string().uuid().optional(),
});

export const suggestSchema = z.object({
  context: z.object({
    type: z.enum(['task_priority', 'next_steps', 'related_items', 'improvements']),
    data: z.record(z.string(), z.any()),
  }),
  workspaceId: z.string().uuid().optional(),
});

export type SummarizeInput = z.infer<typeof summarizeSchema>;
export type GenerateInput = z.infer<typeof generateSchema>;
export type SuggestInput = z.infer<typeof suggestSchema>;
