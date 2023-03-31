import express from 'express';
import kanbanApi from './api/kanban';
import { pathsWithPermissons } from '../pathsWithPermissons';
import kanbanApiWithPermissions from './api/kanbanWithPermissions'
import { checkPermissionsMW } from '../middlewares/permissionMiddleware';

const router = express.Router();

router.use(pathsWithPermissons.kanban, kanbanApi);
router.use(pathsWithPermissons.kanban, checkPermissionsMW, kanbanApiWithPermissions);


export default router;
