import { Router } from 'express';
import * as plannerController from './planner.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import {
  createProjectSchema,
  updateProjectSchema,
  createBoardSchema,
  createColumnSchema,
  updateColumnSchema,
  reorderColumnsSchema,
  createTaskSchema,
  updateTaskSchema,
  moveTaskSchema,
  createCommentSchema,
  createLabelSchema,
  createEventSchema,
  updateEventSchema,
  listTasksQuerySchema,
  listEventsQuerySchema,
} from './planner.schema';
import { paginationSchema } from '../../shared/pagination';

const router = Router();

router.use(authenticate);

// --- Projects ---
router.post(
  '/workspaces/:workspaceId/projects',
  validate(createProjectSchema),
  plannerController.createProject,
);
router.get(
  '/workspaces/:workspaceId/projects',
  validate(paginationSchema, 'query'),
  plannerController.listProjects,
);
router.get('/projects/:projectId', plannerController.getProject);
router.patch(
  '/projects/:projectId',
  validate(updateProjectSchema),
  plannerController.updateProject,
);
router.delete('/projects/:projectId', plannerController.deleteProject);

// --- Boards ---
router.post(
  '/projects/:projectId/boards',
  validate(createBoardSchema),
  plannerController.createBoard,
);
router.get('/projects/:projectId/boards', plannerController.listBoards);
router.get('/boards/:boardId', plannerController.getBoard);
router.delete('/boards/:boardId', plannerController.deleteBoard);

// --- Columns ---
router.post(
  '/boards/:boardId/columns',
  validate(createColumnSchema),
  plannerController.createColumn,
);
router.patch(
  '/boards/:boardId/columns/reorder',
  validate(reorderColumnsSchema),
  plannerController.reorderColumns,
);
router.patch(
  '/boards/:boardId/columns/:columnId',
  validate(updateColumnSchema),
  plannerController.updateColumn,
);
router.delete('/boards/:boardId/columns/:columnId', plannerController.deleteColumn);

// --- Tasks ---
router.post(
  '/projects/:projectId/tasks',
  validate(createTaskSchema),
  plannerController.createTask,
);
router.get(
  '/projects/:projectId/tasks',
  validate(listTasksQuerySchema, 'query'),
  plannerController.listTasks,
);
router.get('/tasks/:taskId', plannerController.getTask);
router.patch('/tasks/:taskId', validate(updateTaskSchema), plannerController.updateTask);
router.delete('/tasks/:taskId', plannerController.deleteTask);
router.patch('/tasks/:taskId/move', validate(moveTaskSchema), plannerController.moveTask);

// --- Comments ---
router.post(
  '/tasks/:taskId/comments',
  validate(createCommentSchema),
  plannerController.createComment,
);
router.get('/tasks/:taskId/comments', plannerController.listComments);
router.delete('/comments/:commentId', plannerController.deleteComment);

// --- Labels ---
router.post(
  '/tasks/:taskId/labels',
  validate(createLabelSchema),
  plannerController.createLabel,
);
router.delete('/tasks/:taskId/labels/:labelId', plannerController.deleteLabel);

// --- Events ---
router.post(
  '/projects/:projectId/events',
  validate(createEventSchema),
  plannerController.createEvent,
);
router.get(
  '/projects/:projectId/events',
  validate(listEventsQuerySchema, 'query'),
  plannerController.listEvents,
);
router.patch('/events/:eventId', validate(updateEventSchema), plannerController.updateEvent);
router.delete('/events/:eventId', plannerController.deleteEvent);

export default router;
