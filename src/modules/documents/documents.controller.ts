import { Request, Response } from 'express';
import * as documentsService from './documents.service';

export async function create(req: Request, res: Response) {
  const result = await documentsService.createDocument(req.params.workspaceId, req.body);
  res.status(201).json({ success: true, data: result });
}

export async function list(req: Request, res: Response) {
  const result = await documentsService.listDocuments(
    req.params.workspaceId,
    req.query.type as string | undefined
  );
  res.json({ success: true, data: result });
}

export async function get(req: Request, res: Response) {
  const result = await documentsService.getDocument(req.params.documentId);
  res.json({ success: true, data: result });
}

export async function update(req: Request, res: Response) {
  const result = await documentsService.updateDocument(req.params.documentId, req.body);
  res.json({ success: true, data: result });
}

export async function remove(req: Request, res: Response) {
  await documentsService.deleteDocument(req.params.documentId);
  res.json({ success: true, message: 'Document deleted' });
}

export async function createVersion(req: Request, res: Response) {
  const result = await documentsService.createVersion(req.params.documentId, req.user!.userId);
  res.status(201).json({ success: true, data: result });
}

export async function listVersions(req: Request, res: Response) {
  const result = await documentsService.listVersions(req.params.documentId);
  res.json({ success: true, data: result });
}

export async function getVersion(req: Request, res: Response) {
  const result = await documentsService.getVersion(
    req.params.documentId,
    parseInt(req.params.version, 10)
  );
  res.json({ success: true, data: result });
}

export async function restoreVersion(req: Request, res: Response) {
  const result = await documentsService.restoreVersion(
    req.params.documentId,
    parseInt(req.params.version, 10)
  );
  res.json({ success: true, data: result });
}

export async function addCollaborator(req: Request, res: Response) {
  const result = await documentsService.addCollaborator(
    req.params.documentId,
    req.body.userId,
    req.body.permission
  );
  res.status(201).json({ success: true, data: result });
}

export async function removeCollaborator(req: Request, res: Response) {
  await documentsService.removeCollaborator(req.params.documentId, req.params.userId);
  res.json({ success: true, message: 'Collaborator removed' });
}

export async function exportDocument(req: Request, res: Response) {
  const result = await documentsService.exportDocument(
    req.params.documentId,
    (req.query.format as string) || 'json'
  );

  if (result.format === 'html') {
    res.setHeader('Content-Type', 'text/html');
    res.send(result.data);
    return;
  }

  res.json({ success: true, data: result.data });
}
