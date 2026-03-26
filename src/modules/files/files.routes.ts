import { Router } from 'express';
import * as filesController from './files.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { uploadSingle } from '../../middleware/upload';
import { createFolderSchema, updateFileSchema, listFilesQuery } from './files.schema';

const router = Router();

// Workspace-scoped routes
router.post('/workspaces/:workspaceId/files/upload', authenticate, uploadSingle('file'), filesController.upload);
router.post('/workspaces/:workspaceId/files/folder', authenticate, validate(createFolderSchema), filesController.createFolder);
router.get('/workspaces/:workspaceId/files', authenticate, validate(listFilesQuery, 'query'), filesController.list);
router.get('/workspaces/:workspaceId/files/:fileId', authenticate, filesController.get);
router.get('/workspaces/:workspaceId/files/:fileId/download', authenticate, filesController.download);
router.patch('/workspaces/:workspaceId/files/:fileId', authenticate, validate(updateFileSchema), filesController.update);
router.delete('/workspaces/:workspaceId/files/:fileId', authenticate, filesController.remove);

// File version routes
router.get('/files/:fileId/versions', authenticate, filesController.listVersions);
router.get('/files/:fileId/versions/:version/download', authenticate, filesController.downloadVersion);
router.post('/files/:fileId/upload', authenticate, uploadSingle('file'), filesController.uploadNewVersion);

export default router;
