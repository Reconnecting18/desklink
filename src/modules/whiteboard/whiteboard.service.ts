import { prisma } from '../../config/database';
import { NotFoundError } from '../../shared/errors';
import type { CreateWhiteboardInput, UpdateWhiteboardInput, CreateElementInput, UpdateElementInput } from './whiteboard.schema';

// Whiteboards
export async function createWhiteboard(workspaceId: string, input: CreateWhiteboardInput) {
  return prisma.whiteboard.create({
    data: { title: input.title, workspaceId },
  });
}

export async function listWhiteboards(workspaceId: string) {
  return prisma.whiteboard.findMany({
    where: { workspaceId },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function getWhiteboard(whiteboardId: string) {
  const wb = await prisma.whiteboard.findUnique({
    where: { id: whiteboardId },
    include: { elements: { orderBy: { zIndex: 'asc' } }, collaborators: true },
  });
  if (!wb) throw new NotFoundError('Whiteboard');
  return wb;
}

export async function updateWhiteboard(whiteboardId: string, input: UpdateWhiteboardInput) {
  await getWhiteboard(whiteboardId);
  return prisma.whiteboard.update({
    where: { id: whiteboardId },
    data: input,
  });
}

export async function deleteWhiteboard(whiteboardId: string) {
  await getWhiteboard(whiteboardId);
  await prisma.whiteboard.delete({ where: { id: whiteboardId } });
}

// Elements
export async function createElement(whiteboardId: string, input: CreateElementInput) {
  await getWhiteboard(whiteboardId);
  return prisma.whiteboardElement.create({
    data: {
      whiteboardId,
      type: input.type,
      data: input.data as any,
      zIndex: input.zIndex ?? 0,
    },
  });
}

export async function updateElement(elementId: string, input: UpdateElementInput) {
  const element = await prisma.whiteboardElement.findUnique({ where: { id: elementId } });
  if (!element) throw new NotFoundError('Element');
  return prisma.whiteboardElement.update({
    where: { id: elementId },
    data: {
      ...(input.data !== undefined ? { data: input.data as any } : {}),
      ...(input.zIndex !== undefined ? { zIndex: input.zIndex } : {}),
    },
  });
}

export async function deleteElement(elementId: string) {
  const element = await prisma.whiteboardElement.findUnique({ where: { id: elementId } });
  if (!element) throw new NotFoundError('Element');
  await prisma.whiteboardElement.delete({ where: { id: elementId } });
}

export async function lockElement(elementId: string, userId: string) {
  return prisma.whiteboardElement.update({
    where: { id: elementId },
    data: { lockedBy: userId },
  });
}

export async function unlockElement(elementId: string) {
  return prisma.whiteboardElement.update({
    where: { id: elementId },
    data: { lockedBy: null },
  });
}

// Collaborators
export async function addCollaborator(whiteboardId: string, userId: string, permission: string) {
  return prisma.whiteboardCollaborator.create({
    data: { whiteboardId, userId, permission },
  });
}

export async function removeCollaborator(whiteboardId: string, userId: string) {
  await prisma.whiteboardCollaborator.delete({
    where: { whiteboardId_userId: { whiteboardId, userId } },
  });
}
