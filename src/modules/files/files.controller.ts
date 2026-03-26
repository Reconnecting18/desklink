import { Request, Response } from 'express';
import * as filesService from './files.service';

export async function upload(req: Request, res: Response) {
  const file = req.file as Express.Multer.File;
  const result = await filesService.uploadFile(
    req.params.workspaceId,
    req.user!.userId,
    { originalname: file.originalname, buffer: file.buffer, mimetype: file.mimetype, size: file.size },
    req.body.parentId
  );
  res.status(201).json({ success: true, data: result });
}

export async function createFolder(req: Request, res: Response) {
  const result = await filesService.createFolder(req.params.workspaceId, req.body);
  res.status(201).json({ success: true, data: result });
}

export async function list(req: Request, res: Response) {
  const result = await filesService.listFiles(
    req.params.workspaceId,
    req.query.parentId as string | undefined
  );
  res.json({ success: true, data: result });
}

export async function get(req: Request, res: Response) {
  const result = await filesService.getFile(req.params.fileId);
  res.json({ success: true, data: result });
}

export async function download(req: Request, res: Response) {
  const { file, buffer } = await filesService.downloadFile(req.params.fileId);
  res.setHeader('Content-Type', file.mimeType);
  res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
  res.send(buffer);
}

export async function update(req: Request, res: Response) {
  const result = await filesService.updateFile(req.params.fileId, req.body);
  res.json({ success: true, data: result });
}

export async function remove(req: Request, res: Response) {
  await filesService.deleteFile(req.params.fileId);
  res.json({ success: true, message: 'File deleted' });
}

export async function listVersions(req: Request, res: Response) {
  const result = await filesService.listVersions(req.params.fileId);
  res.json({ success: true, data: result });
}

export async function downloadVersion(req: Request, res: Response) {
  const { file, buffer } = await filesService.downloadVersion(
    req.params.fileId,
    parseInt(req.params.version, 10)
  );
  res.setHeader('Content-Type', file.mimeType);
  res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
  res.send(buffer);
}

export async function uploadNewVersion(req: Request, res: Response) {
  const file = req.file as Express.Multer.File;
  const result = await filesService.uploadNewVersion(req.params.fileId, req.user!.userId, {
    buffer: file.buffer,
    mimetype: file.mimetype,
    size: file.size,
  });
  res.status(201).json({ success: true, data: result });
}
