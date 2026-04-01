import { prisma } from '../../config/database';
import { NotFoundError } from '../../shared/errors';
import type { CreateDocumentInput, UpdateDocumentInput } from './documents.schema';

function parseJson(value: string | null | undefined): any {
  if (value == null) return null;
  try { return JSON.parse(value); } catch { return value; }
}

function withParsedContent<T extends { content: string }>(doc: T): T & { content: any } {
  return { ...doc, content: parseJson(doc.content) };
}

export async function createDocument(workspaceId: string, input: CreateDocumentInput) {
  const defaultContent = getDefaultContent(input.type);
  const doc = await prisma.document.create({
    data: {
      title: input.title,
      type: input.type,
      workspaceId,
      content: JSON.stringify(input.content ?? defaultContent),
    },
  });
  return withParsedContent(doc);
}

export async function listDocuments(workspaceId: string, type?: string) {
  const docs = await prisma.document.findMany({
    where: {
      workspaceId,
      ...(type ? { type } : {}),
    },
    orderBy: { updatedAt: 'desc' },
  });
  return docs.map(withParsedContent);
}

export async function getDocument(documentId: string) {
  const doc = await prisma.document.findUnique({
    where: { id: documentId },
    include: { versions: { orderBy: { version: 'desc' }, take: 5 }, collaborators: true },
  });
  if (!doc) throw new NotFoundError('Document');
  return {
    ...doc,
    content: parseJson(doc.content),
    versions: doc.versions.map((v) => ({ ...v, content: parseJson(v.content) })),
  };
}

export async function updateDocument(documentId: string, input: UpdateDocumentInput) {
  await getDocument(documentId);
  const data: Record<string, unknown> = {};
  if (input.title !== undefined) data.title = input.title;
  if (input.content !== undefined) data.content = JSON.stringify(input.content);
  const doc = await prisma.document.update({
    where: { id: documentId },
    data,
  });
  return withParsedContent(doc);
}

export async function deleteDocument(documentId: string) {
  await getDocument(documentId);
  await prisma.document.delete({ where: { id: documentId } });
}

export async function createVersion(documentId: string, createdBy: string) {
  const doc = await prisma.document.findUnique({ where: { id: documentId } });
  if (!doc) throw new NotFoundError('Document');
  const latestVersion = await prisma.documentVersion.findFirst({
    where: { documentId },
    orderBy: { version: 'desc' },
  });
  const newVersion = (latestVersion?.version ?? 0) + 1;

  const ver = await prisma.documentVersion.create({
    data: {
      documentId,
      version: newVersion,
      content: doc.content,
      createdBy,
    },
  });
  return { ...ver, content: parseJson(ver.content) };
}

export async function listVersions(documentId: string) {
  await getDocument(documentId);
  const versions = await prisma.documentVersion.findMany({
    where: { documentId },
    orderBy: { version: 'desc' },
  });
  return versions.map((v) => ({ ...v, content: parseJson(v.content) }));
}

export async function getVersion(documentId: string, version: number) {
  const ver = await prisma.documentVersion.findUnique({
    where: { documentId_version: { documentId, version } },
  });
  if (!ver) throw new NotFoundError('Document version');
  return { ...ver, content: parseJson(ver.content) };
}

export async function restoreVersion(documentId: string, version: number) {
  const ver = await prisma.documentVersion.findUnique({
    where: { documentId_version: { documentId, version } },
  });
  if (!ver) throw new NotFoundError('Document version');
  const doc = await prisma.document.update({
    where: { id: documentId },
    data: { content: ver.content },
  });
  return withParsedContent(doc);
}

export async function addCollaborator(
  documentId: string,
  userId: string,
  permission: string
) {
  await getDocument(documentId);
  return prisma.documentCollaborator.create({
    data: { documentId, userId, permission },
  });
}

export async function removeCollaborator(documentId: string, userId: string) {
  await prisma.documentCollaborator.delete({
    where: { documentId_userId: { documentId, userId } },
  });
}

export async function exportDocument(documentId: string, format: string) {
  const doc = await getDocument(documentId);

  if (format === 'json') {
    return { format: 'json', data: doc.content };
  }

  if (format === 'html' && doc.type === 'DOCUMENT') {
    const content = doc.content;
    const blocks = content.blocks || [];
    const html = blocks
      .map((block: any) => {
        switch (block.type) {
          case 'heading':
            return `<h${block.level || 1}>${block.content}</h${block.level || 1}>`;
          case 'paragraph':
            return `<p>${block.content}</p>`;
          case 'list':
            const items = (block.items || []).map((i: string) => `<li>${i}</li>`).join('');
            return `<ul>${items}</ul>`;
          default:
            return `<p>${block.content || ''}</p>`;
        }
      })
      .join('\n');
    return { format: 'html', data: `<!DOCTYPE html><html><body>${html}</body></html>` };
  }

  return { format: 'json', data: doc.content };
}

type DocumentTypeValue = 'DOCUMENT' | 'SPREADSHEET' | 'PRESENTATION';

function getDefaultContent(type: DocumentTypeValue | string) {
  switch (type) {
    case 'DOCUMENT':
      return { blocks: [{ type: 'paragraph', content: '' }] };
    case 'SPREADSHEET':
      return { sheets: [{ name: 'Sheet 1', rows: {} }] };
    case 'PRESENTATION':
      return { slides: [{ elements: [{ type: 'title', content: 'Untitled Presentation' }] }] };
    default:
      return {};
  }
}
