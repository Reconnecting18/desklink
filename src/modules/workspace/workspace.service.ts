import { prisma } from '../../config/database';
import { ConflictError, NotFoundError, ForbiddenError } from '../../shared/errors';
import type { CreateWorkspaceInput, UpdateWorkspaceInput, AddMemberInput } from './workspace.schema';

export async function createWorkspace(ownerId: string, input: CreateWorkspaceInput) {
  const workspace = await prisma.workspace.create({
    data: {
      name: input.name,
      slug: input.slug,
      ownerId,
      members: {
        create: {
          userId: ownerId,
          role: 'ADMIN',
        },
      },
    },
    include: {
      owner: { select: { id: true, email: true, displayName: true } },
      _count: { select: { members: true } },
    },
  });

  return workspace;
}

export async function listWorkspaces(userId: string) {
  const workspaces = await prisma.workspace.findMany({
    where: {
      members: { some: { userId } },
    },
    include: {
      owner: { select: { id: true, email: true, displayName: true } },
      _count: { select: { members: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return workspaces;
}

export async function getWorkspace(workspaceId: string) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      owner: { select: { id: true, email: true, displayName: true } },
      members: {
        include: {
          user: { select: { id: true, email: true, displayName: true, avatarUrl: true } },
        },
        orderBy: { joinedAt: 'asc' },
      },
    },
  });

  if (!workspace) {
    throw new NotFoundError('Workspace');
  }

  return workspace;
}

export async function updateWorkspace(workspaceId: string, input: UpdateWorkspaceInput) {
  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  if (!workspace) {
    throw new NotFoundError('Workspace');
  }

  const updated = await prisma.workspace.update({
    where: { id: workspaceId },
    data: input,
    include: {
      owner: { select: { id: true, email: true, displayName: true } },
      _count: { select: { members: true } },
    },
  });

  return updated;
}

export async function deleteWorkspace(workspaceId: string, userId: string) {
  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  if (!workspace) {
    throw new NotFoundError('Workspace');
  }

  if (workspace.ownerId !== userId) {
    throw new ForbiddenError('Only the workspace owner can delete this workspace');
  }

  await prisma.workspace.delete({ where: { id: workspaceId } });
}

export async function addMember(workspaceId: string, input: AddMemberInput) {
  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  if (!workspace) {
    throw new NotFoundError('Workspace');
  }

  const existing = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: input.userId, workspaceId } },
  });

  if (existing) {
    throw new ConflictError('User is already a member of this workspace');
  }

  const member = await prisma.workspaceMember.create({
    data: {
      userId: input.userId,
      workspaceId,
      role: input.role,
    },
    include: {
      user: { select: { id: true, email: true, displayName: true, avatarUrl: true } },
    },
  });

  return member;
}

export async function listMembers(workspaceId: string) {
  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  if (!workspace) {
    throw new NotFoundError('Workspace');
  }

  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    include: {
      user: { select: { id: true, email: true, displayName: true, avatarUrl: true } },
    },
    orderBy: { joinedAt: 'asc' },
  });

  return members;
}

export async function removeMember(workspaceId: string, userId: string) {
  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  if (!workspace) {
    throw new NotFoundError('Workspace');
  }

  if (workspace.ownerId === userId) {
    throw new ForbiddenError('Cannot remove the workspace owner');
  }

  const member = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });

  if (!member) {
    throw new NotFoundError('WorkspaceMember');
  }

  await prisma.workspaceMember.delete({
    where: { userId_workspaceId: { userId, workspaceId } },
  });
}
