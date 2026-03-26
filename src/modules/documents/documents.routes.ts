import { Router } from 'express';
import * as documentsController from './documents.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import {
  createDocumentSchema,
  updateDocumentSchema,
  listDocumentsQuery,
  addCollaboratorSchema,
} from './documents.schema';

const router = Router();

// Workspace-scoped routes
router.post('/workspaces/:workspaceId/documents', authenticate, validate(createDocumentSchema), documentsController.create);
router.get('/workspaces/:workspaceId/documents', authenticate, validate(listDocumentsQuery, 'query'), documentsController.list);
router.get('/workspaces/:workspaceId/documents/:documentId', authenticate, documentsController.get);
router.patch('/workspaces/:workspaceId/documents/:documentId', authenticate, validate(updateDocumentSchema), documentsController.update);
router.delete('/workspaces/:workspaceId/documents/:documentId', authenticate, documentsController.remove);

// Versioning
router.get('/documents/:documentId/versions', authenticate, documentsController.listVersions);
router.get('/documents/:documentId/versions/:version', authenticate, documentsController.getVersion);
router.post('/documents/:documentId/versions', authenticate, documentsController.createVersion);
router.post('/documents/:documentId/restore/:version', authenticate, documentsController.restoreVersion);

// Export
router.get('/documents/:documentId/export', authenticate, documentsController.exportDocument);

// Collaborators
router.post('/documents/:documentId/collaborators', authenticate, validate(addCollaboratorSchema), documentsController.addCollaborator);
router.delete('/documents/:documentId/collaborators/:userId', authenticate, documentsController.removeCollaborator);

export default router;
