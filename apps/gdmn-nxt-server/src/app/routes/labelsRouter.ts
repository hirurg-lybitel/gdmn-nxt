import { Action } from './../../../../../libs/util-api-types/src/lib/crmDataTypes';
import { checkPermissionsMW } from '../middlewares/permissionMiddleware';
import express from 'express';
import labels from '../handlers/labels';
import { pathsWithPermissons } from '../pathsWithPermissons';

const router = express.Router();

router.get(pathsWithPermissons.labels, labels.get);
router.get(`${pathsWithPermissons.labels}/:id`, labels.get);
router.post(pathsWithPermissons.labels, checkPermissionsMW, labels.upsert);
router.put(`${pathsWithPermissons.labels}/:id`, checkPermissionsMW, labels.upsert);
router.delete(`${pathsWithPermissons.labels}/:id`, checkPermissionsMW, labels.remove);

export default router;
