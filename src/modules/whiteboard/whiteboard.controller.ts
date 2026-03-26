import { Request, Response } from 'express';
import * as whiteboardService from './whiteboard.service';

export async function create(req: Request, res: Response) {
  const result = await whiteboardService.createWhiteboard(req.params.workspaceId, req.body);
  res.status(201).json({ success: true, data: result });
}

export async function list(req: Request, res: Response) {
  const result = await whiteboardService.listWhiteboards(req.params.workspaceId);
  res.json({ success: true, data: result });
}

export async function get(req: Request, res: Response) {
  const result = await whiteboardService.getWhiteboard(req.params.whiteboardId);
  res.json({ success: true, data: result });
}

export async function update(req: Request, res: Response) {
  const result = await whiteboardService.updateWhiteboard(req.params.whiteboardId, req.body);
  res.json({ success: true, data: result });
}

export async function remove(req: Request, res: Response) {
  await whiteboardService.deleteWhiteboard(req.params.whiteboardId);
  res.json({ success: true, message: 'Whiteboard deleted' });
}

export async function createElement(req: Request, res: Response) {
  const result = await whiteboardService.createElement(req.params.whiteboardId, req.body);
  res.status(201).json({ success: true, data: result });
}

export async function updateElement(req: Request, res: Response) {
  const result = await whiteboardService.updateElement(req.params.elementId, req.body);
  res.json({ success: true, data: result });
}

export async function deleteElement(req: Request, res: Response) {
  await whiteboardService.deleteElement(req.params.elementId);
  res.json({ success: true, message: 'Element deleted' });
}

export async function addCollaborator(req: Request, res: Response) {
  const result = await whiteboardService.addCollaborator(
    req.params.whiteboardId,
    req.body.userId,
    req.body.permission
  );
  res.status(201).json({ success: true, data: result });
}

export async function removeCollaborator(req: Request, res: Response) {
  await whiteboardService.removeCollaborator(req.params.whiteboardId, req.params.userId);
  res.json({ success: true, message: 'Collaborator removed' });
}
