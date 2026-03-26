import { Request, Response } from 'express';
import * as mockupsService from './mockups.service';

export async function create(req: Request, res: Response) {
  const result = await mockupsService.createMockup(req.params.workspaceId, req.body);
  res.status(201).json({ success: true, data: result });
}

export async function list(req: Request, res: Response) {
  const result = await mockupsService.listMockups(req.params.workspaceId);
  res.json({ success: true, data: result });
}

export async function get(req: Request, res: Response) {
  const result = await mockupsService.getMockup(req.params.mockupId);
  res.json({ success: true, data: result });
}

export async function update(req: Request, res: Response) {
  const result = await mockupsService.updateMockup(req.params.mockupId, req.body);
  res.json({ success: true, data: result });
}

export async function remove(req: Request, res: Response) {
  await mockupsService.deleteMockup(req.params.mockupId);
  res.json({ success: true, message: 'Mockup deleted' });
}

export async function createScreen(req: Request, res: Response) {
  const result = await mockupsService.createScreen(req.params.mockupId, req.body);
  res.status(201).json({ success: true, data: result });
}

export async function getScreen(req: Request, res: Response) {
  const result = await mockupsService.getScreen(req.params.screenId);
  res.json({ success: true, data: result });
}

export async function updateScreen(req: Request, res: Response) {
  const result = await mockupsService.updateScreen(req.params.screenId, req.body);
  res.json({ success: true, data: result });
}

export async function deleteScreen(req: Request, res: Response) {
  await mockupsService.deleteScreen(req.params.screenId);
  res.json({ success: true, message: 'Screen deleted' });
}

export async function reorderScreens(req: Request, res: Response) {
  await mockupsService.reorderScreens(req.body.screens);
  res.json({ success: true, message: 'Screens reordered' });
}

export async function createAnnotation(req: Request, res: Response) {
  const result = await mockupsService.createAnnotation(
    req.params.screenId,
    req.user!.userId,
    req.body
  );
  res.status(201).json({ success: true, data: result });
}

export async function updateAnnotation(req: Request, res: Response) {
  const result = await mockupsService.updateAnnotation(req.params.annotationId, req.body);
  res.json({ success: true, data: result });
}

export async function deleteAnnotation(req: Request, res: Response) {
  await mockupsService.deleteAnnotation(req.params.annotationId);
  res.json({ success: true, message: 'Annotation deleted' });
}
