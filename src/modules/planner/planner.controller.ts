import { Request, Response } from 'express';
import * as plannerService from './planner.service';

// =====================
// Projects
// =====================

export async function createProject(req: Request, res: Response) {
  const { workspaceId } = req.params;
  const result = await plannerService.createProject(workspaceId, req.body);
  res.status(201).json({ success: true, data: result });
}

export async function listProjects(req: Request, res: Response) {
  const { workspaceId } = req.params;
  const result = await plannerService.listProjects(workspaceId, req.query as any);
  res.json({ success: true, data: result });
}

export async function getProject(req: Request, res: Response) {
  const result = await plannerService.getProject(req.params.projectId);
  res.json({ success: true, data: result });
}

export async function updateProject(req: Request, res: Response) {
  const result = await plannerService.updateProject(req.params.projectId, req.body);
  res.json({ success: true, data: result });
}

export async function deleteProject(req: Request, res: Response) {
  await plannerService.deleteProject(req.params.projectId);
  res.json({ success: true, data: null });
}

// =====================
// Boards
// =====================

export async function createBoard(req: Request, res: Response) {
  const result = await plannerService.createBoard(req.params.projectId, req.body);
  res.status(201).json({ success: true, data: result });
}

export async function listBoards(req: Request, res: Response) {
  const result = await plannerService.listBoards(req.params.projectId);
  res.json({ success: true, data: result });
}

export async function getBoard(req: Request, res: Response) {
  const result = await plannerService.getBoard(req.params.boardId);
  res.json({ success: true, data: result });
}

export async function deleteBoard(req: Request, res: Response) {
  await plannerService.deleteBoard(req.params.boardId);
  res.json({ success: true, data: null });
}

// =====================
// Columns
// =====================

export async function createColumn(req: Request, res: Response) {
  const result = await plannerService.createColumn(req.params.boardId, req.body);
  res.status(201).json({ success: true, data: result });
}

export async function updateColumn(req: Request, res: Response) {
  const result = await plannerService.updateColumn(req.params.columnId, req.body);
  res.json({ success: true, data: result });
}

export async function deleteColumn(req: Request, res: Response) {
  await plannerService.deleteColumn(req.params.columnId);
  res.json({ success: true, data: null });
}

export async function reorderColumns(req: Request, res: Response) {
  const result = await plannerService.reorderColumns(req.params.boardId, req.body);
  res.json({ success: true, data: result });
}

// =====================
// Tasks
// =====================

export async function createTask(req: Request, res: Response) {
  const result = await plannerService.createTask(
    req.params.projectId,
    req.user!.userId,
    req.body,
  );
  res.status(201).json({ success: true, data: result });
}

export async function listTasks(req: Request, res: Response) {
  const result = await plannerService.listTasks(req.params.projectId, req.query as any);
  res.json({ success: true, data: result });
}

export async function getTask(req: Request, res: Response) {
  const result = await plannerService.getTask(req.params.taskId);
  res.json({ success: true, data: result });
}

export async function updateTask(req: Request, res: Response) {
  const result = await plannerService.updateTask(req.params.taskId, req.body);
  res.json({ success: true, data: result });
}

export async function deleteTask(req: Request, res: Response) {
  await plannerService.deleteTask(req.params.taskId);
  res.json({ success: true, data: null });
}

export async function moveTask(req: Request, res: Response) {
  const result = await plannerService.moveTask(req.params.taskId, req.body);
  res.json({ success: true, data: result });
}

// =====================
// Comments
// =====================

export async function createComment(req: Request, res: Response) {
  const result = await plannerService.createComment(
    req.params.taskId,
    req.user!.userId,
    req.body,
  );
  res.status(201).json({ success: true, data: result });
}

export async function listComments(req: Request, res: Response) {
  const result = await plannerService.listComments(req.params.taskId);
  res.json({ success: true, data: result });
}

export async function deleteComment(req: Request, res: Response) {
  await plannerService.deleteComment(req.params.commentId);
  res.json({ success: true, data: null });
}

// =====================
// Labels
// =====================

export async function createLabel(req: Request, res: Response) {
  const result = await plannerService.createLabel(req.params.taskId, req.body);
  res.status(201).json({ success: true, data: result });
}

export async function deleteLabel(req: Request, res: Response) {
  await plannerService.deleteLabel(req.params.labelId);
  res.json({ success: true, data: null });
}

// =====================
// Events
// =====================

export async function createEvent(req: Request, res: Response) {
  const result = await plannerService.createEvent(req.params.projectId, req.body);
  res.status(201).json({ success: true, data: result });
}

export async function listEvents(req: Request, res: Response) {
  const result = await plannerService.listEvents(req.params.projectId, req.query as any);
  res.json({ success: true, data: result });
}

export async function updateEvent(req: Request, res: Response) {
  const result = await plannerService.updateEvent(req.params.eventId, req.body);
  res.json({ success: true, data: result });
}

export async function deleteEvent(req: Request, res: Response) {
  await plannerService.deleteEvent(req.params.eventId);
  res.json({ success: true, data: null });
}
