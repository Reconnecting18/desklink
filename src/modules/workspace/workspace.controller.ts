import { Request, Response } from 'express';
import * as workspaceService from './workspace.service';

export async function create(req: Request, res: Response) {
  const result = await workspaceService.createWorkspace(req.user!.userId, req.body);
  res.status(201).json({ success: true, data: result });
}

export async function list(req: Request, res: Response) {
  const result = await workspaceService.listWorkspaces(req.user!.userId);
  res.json({ success: true, data: result });
}

export async function get(req: Request, res: Response) {
  const result = await workspaceService.getWorkspace(req.params.workspaceId);
  res.json({ success: true, data: result });
}

export async function update(req: Request, res: Response) {
  const result = await workspaceService.updateWorkspace(req.params.workspaceId, req.body);
  res.json({ success: true, data: result });
}

export async function remove(req: Request, res: Response) {
  await workspaceService.deleteWorkspace(req.params.workspaceId, req.user!.userId);
  res.json({ success: true, data: null });
}

export async function addMember(req: Request, res: Response) {
  const result = await workspaceService.addMember(req.params.workspaceId, req.body);
  res.status(201).json({ success: true, data: result });
}

export async function listMembers(req: Request, res: Response) {
  const result = await workspaceService.listMembers(req.params.workspaceId);
  res.json({ success: true, data: result });
}

export async function removeMember(req: Request, res: Response) {
  await workspaceService.removeMember(req.params.workspaceId, req.params.userId);
  res.json({ success: true, data: null });
}
