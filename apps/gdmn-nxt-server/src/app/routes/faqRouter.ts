import { Action } from '@gsbelarus/util-api-types';
import { checkPermissionsMW } from '../middlewares/permissionMiddleware';
import express from 'express';
import faq from '../handlers/faq';
import { pathsWithPermissons } from '../pathsWithPermissons';

const router = express.Router();

router.get('/faq', faq.get);
router.get('/faq/:id', faq.get);
router.post(pathsWithPermissons.faq, checkPermissionsMW, faq.upsert);
router.put(`${pathsWithPermissons.faq}/:id`, checkPermissionsMW, faq.upsert);
router.delete(`${pathsWithPermissons.faq}/:id`, checkPermissionsMW, faq.remove);

export default router;
