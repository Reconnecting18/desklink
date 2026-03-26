import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { prisma } from '../../config/database';
import { getStorage } from '../../storage';
import { NotFoundError } from '../../shared/errors';
import type { CreateFolderInput, UpdateFileInput } from './files.schema';

export async function uploadFile(
  workspaceId: string,
  userId: string,
  file: { originalname: string; buffer: Buffer; mimetype: string; size: number },
  parentId?: string
) {
  const storage = getStorage();
  const ext = path.extname(file.originalname);
  const storageKey = `${workspaceId}/${uuidv4()}${ext}`;

  await storage.save(storageKey, file.buffer, file.mimetype);

  const record = await prisma.file.create({
    data: {
      name: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      storagePath: storageKey,
      workspaceId,
      parentId: parentId || null,
    },
  });

  await prisma.fileVersion.create({
    data: {
      fileId: record.id,
      version: 1,
      storagePath: storageKey,
      size: file.size,
      uploadedBy: userId,
    },
  });

  return record;
}

export async function createFolder(workspaceId: string, input: CreateFolderInput) {
  return prisma.file.create({
    data: {
      name: input.name,
      mimeType: 'inode/directory',
      size: 0,
      storagePath: '',
      workspaceId,
      parentId: input.parentId || null,
      isFolder: true,
    },
  });
}

export async function listFiles(workspaceId: string, parentId?: string) {
  return prisma.file.findMany({
    where: { workspaceId, parentId: parentId || null },
    orderBy: [{ isFolder: 'desc' }, { name: 'asc' }],
  });
}

export async function getFile(fileId: string) {
  const file = await prisma.file.findUnique({ where: { id: fileId } });
  if (!file) throw new NotFoundError('File');
  return file;
}

export async function downloadFile(fileId: string) {
  const file = await getFile(fileId);
  const storage = getStorage();
  const buffer = await storage.read(file.storagePath);
  return { file, buffer };
}

export async function updateFile(fileId: string, input: UpdateFileInput) {
  await getFile(fileId);
  return prisma.file.update({
    where: { id: fileId },
    data: input,
  });
}

export async function deleteFile(fileId: string) {
  const file = await getFile(fileId);
  if (!file.isFolder && file.storagePath) {
    const storage = getStorage();
    await storage.delete(file.storagePath);
  }
  await prisma.file.delete({ where: { id: fileId } });
}

export async function listVersions(fileId: string) {
  await getFile(fileId);
  return prisma.fileVersion.findMany({
    where: { fileId },
    orderBy: { version: 'desc' },
  });
}

export async function downloadVersion(fileId: string, version: number) {
  const fileVersion = await prisma.fileVersion.findUnique({
    where: { fileId_version: { fileId, version } },
  });
  if (!fileVersion) throw new NotFoundError('File version');

  const storage = getStorage();
  const buffer = await storage.read(fileVersion.storagePath);

  const file = await getFile(fileId);
  return { file, fileVersion, buffer };
}

export async function uploadNewVersion(
  fileId: string,
  userId: string,
  file: { buffer: Buffer; mimetype: string; size: number }
) {
  const existing = await getFile(fileId);
  const storage = getStorage();

  const latestVersion = await prisma.fileVersion.findFirst({
    where: { fileId },
    orderBy: { version: 'desc' },
  });

  const newVersion = (latestVersion?.version ?? 0) + 1;
  const ext = path.extname(existing.name);
  const storageKey = `${existing.workspaceId}/${uuidv4()}${ext}`;

  await storage.save(storageKey, file.buffer, file.mimetype);

  const version = await prisma.fileVersion.create({
    data: {
      fileId,
      version: newVersion,
      storagePath: storageKey,
      size: file.size,
      uploadedBy: userId,
    },
  });

  await prisma.file.update({
    where: { id: fileId },
    data: { storagePath: storageKey, size: file.size },
  });

  return version;
}
