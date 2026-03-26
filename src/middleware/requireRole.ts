import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { ForbiddenError, AuthenticationError } from '../shared/errors';

type Role = 'ADMIN' | 'MEMBER' | 'VIEWER';

export function requireRole(...roles: Role[]) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AuthenticationError();
    }

    const workspaceId = req.params.workspaceId || req.params.wsId;
    if (!workspaceId) {
      throw new ForbiddenError('Workspace context required');
    }

    const membership = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: req.user.userId,
          workspaceId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenError('Not a member of this workspace');
    }

    if (roles.length > 0 && !roles.includes(membership.role as Role)) {
      throw new ForbiddenError('Insufficient permissions');
    }

    next();
  };
}
