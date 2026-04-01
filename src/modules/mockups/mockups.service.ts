import { prisma } from '../../config/database';
import { NotFoundError } from '../../shared/errors';
import type { CreateMockupInput, UpdateMockupInput, CreateScreenInput, UpdateScreenInput } from './mockups.schema';

function parseJson(value: string | null | undefined): any {
  if (value == null) return null;
  try { return JSON.parse(value); } catch { return value; }
}

function withParsedElements<T extends { elements: string }>(screen: T): T & { elements: any } {
  return { ...screen, elements: parseJson(screen.elements) };
}

// Mockups
export async function createMockup(workspaceId: string, input: CreateMockupInput) {
  return prisma.mockup.create({
    data: { title: input.title, description: input.description, workspaceId },
  });
}

export async function listMockups(workspaceId: string) {
  return prisma.mockup.findMany({
    where: { workspaceId },
    include: { screens: { select: { id: true, name: true, sortOrder: true } } },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function getMockup(mockupId: string) {
  const mockup = await prisma.mockup.findUnique({
    where: { id: mockupId },
    include: { screens: { orderBy: { sortOrder: 'asc' }, include: { annotations: true } } },
  });
  if (!mockup) throw new NotFoundError('Mockup');
  return {
    ...mockup,
    screens: mockup.screens.map(withParsedElements),
  };
}

export async function updateMockup(mockupId: string, input: UpdateMockupInput) {
  await getMockup(mockupId);
  return prisma.mockup.update({ where: { id: mockupId }, data: input });
}

export async function deleteMockup(mockupId: string) {
  await getMockup(mockupId);
  await prisma.mockup.delete({ where: { id: mockupId } });
}

// Screens
export async function createScreen(mockupId: string, input: CreateScreenInput) {
  await getMockup(mockupId);
  const screen = await prisma.mockupScreen.create({
    data: {
      mockupId,
      name: input.name,
      width: input.width ?? 375,
      height: input.height ?? 812,
      sortOrder: input.sortOrder ?? 0,
      elements: JSON.stringify(input.elements ?? []),
    },
  });
  return withParsedElements(screen);
}

export async function getScreen(screenId: string) {
  const screen = await prisma.mockupScreen.findUnique({
    where: { id: screenId },
    include: { annotations: true },
  });
  if (!screen) throw new NotFoundError('Screen');
  return withParsedElements(screen);
}

export async function updateScreen(screenId: string, input: UpdateScreenInput) {
  await getScreen(screenId);
  const screen = await prisma.mockupScreen.update({
    where: { id: screenId },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.width !== undefined ? { width: input.width } : {}),
      ...(input.height !== undefined ? { height: input.height } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      ...(input.elements !== undefined ? { elements: JSON.stringify(input.elements) } : {}),
    },
  });
  return withParsedElements(screen);
}

export async function deleteScreen(screenId: string) {
  await getScreen(screenId);
  await prisma.mockupScreen.delete({ where: { id: screenId } });
}

export async function reorderScreens(screens: { id: string; sortOrder: number }[]) {
  await prisma.$transaction(
    screens.map((s) =>
      prisma.mockupScreen.update({ where: { id: s.id }, data: { sortOrder: s.sortOrder } })
    )
  );
}

// Annotations
export async function createAnnotation(
  screenId: string,
  authorId: string,
  input: { x: number; y: number; content: string }
) {
  await getScreen(screenId);
  return prisma.mockupAnnotation.create({
    data: { screenId, authorId, x: input.x, y: input.y, content: input.content },
  });
}

export async function updateAnnotation(
  annotationId: string,
  input: { content?: string; resolved?: boolean }
) {
  const annotation = await prisma.mockupAnnotation.findUnique({ where: { id: annotationId } });
  if (!annotation) throw new NotFoundError('Annotation');
  return prisma.mockupAnnotation.update({ where: { id: annotationId }, data: input });
}

export async function deleteAnnotation(annotationId: string) {
  const annotation = await prisma.mockupAnnotation.findUnique({ where: { id: annotationId } });
  if (!annotation) throw new NotFoundError('Annotation');
  await prisma.mockupAnnotation.delete({ where: { id: annotationId } });
}
