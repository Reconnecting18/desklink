import { z } from 'zod/v4';
import { paginationSchema } from '../../shared/pagination';

// --- Projects ---

export const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
});

// --- Boards ---

export const createBoardSchema = z.object({
  name: z.string().min(1).max(100),
});

// --- Columns ---

export const createColumnSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

export const updateColumnSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  color: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

export const reorderColumnsSchema = z.object({
  columns: z.array(
    z.object({
      id: z.string(),
      sortOrder: z.number().int(),
    }),
  ),
});

// --- Tasks ---

const priorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);

export const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  priority: priorityEnum.optional(),
  dueDate: z.string().datetime().optional(),
  columnId: z.string().optional(),
  assigneeId: z.string().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  priority: priorityEnum.optional(),
  dueDate: z.string().datetime().optional(),
  columnId: z.string().optional(),
  assigneeId: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

export const moveTaskSchema = z.object({
  columnId: z.string(),
  sortOrder: z.number().int(),
});

// --- Comments ---

export const createCommentSchema = z.object({
  content: z.string().min(1).max(5000),
});

// --- Labels ---

export const createLabelSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string(),
});

// --- Events ---

export const createEventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  allDay: z.boolean().optional(),
});

export const updateEventSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  allDay: z.boolean().optional(),
});

// --- Query schemas ---

export const listTasksQuerySchema = paginationSchema.extend({
  status: z.string().optional(),
  priority: priorityEnum.optional(),
  assigneeId: z.string().optional(),
});

export const listEventsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// --- Inferred types ---

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CreateBoardInput = z.infer<typeof createBoardSchema>;
export type CreateColumnInput = z.infer<typeof createColumnSchema>;
export type UpdateColumnInput = z.infer<typeof updateColumnSchema>;
export type ReorderColumnsInput = z.infer<typeof reorderColumnsSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type MoveTaskInput = z.infer<typeof moveTaskSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type CreateLabelInput = z.infer<typeof createLabelSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;
export type ListEventsQuery = z.infer<typeof listEventsQuerySchema>;
