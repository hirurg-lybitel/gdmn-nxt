import { Action } from './../../../../../libs/util-api-types/src/lib/crmDataTypes';
import { checkPermissionsMW } from '../middlewares/permissionMiddleware';
import express from 'express';
import permApi from './api/permissions';
import permApiWithPermissions from './api/permissionsWithPermissions'
import { pathsWithPermissons } from '../pathsWithPermissons';

const router = express.Router();

router.use(pathsWithPermissons.permissions, permApi);
router.use(pathsWithPermissons.permissions, checkPermissionsMW, permApiWithPermissions);

export default router;
