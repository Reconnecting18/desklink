import { Router } from 'express';
import * as workspaceController from './workspace.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  addMemberSchema,
} from './workspace.schema';

const router = Router();

router.post('/', authenticate, validate(createWorkspaceSchema), workspaceController.create);
router.get('/', authenticate, workspaceController.list);
router.get('/:workspaceId', authenticate, workspaceController.get);
router.patch('/:workspaceId', authenticate, validate(updateWorkspaceSchema), workspaceController.update);
router.delete('/:workspaceId', authenticate, workspaceController.remove);

router.post('/:workspaceId/members', authenticate, validate(addMemberSchema), workspaceController.addMember);
router.get('/:workspaceId/members', authenticate, workspaceController.listMembers);
router.delete('/:workspaceId/members/:userId', authenticate, workspaceController.removeMember);

export default router;
