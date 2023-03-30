import { Action } from '@gsbelarus/util-api-types';
import { checkPermissionsMW } from '../middlewares/permissionMiddleware';
import express from 'express';
import faq from '../handlers/faq';

const router = express.Router();
router.get('/faq', faq.get);
router.get('/faq/:id', faq.get);
router.post('/faq', checkPermissionsMW(Action.CreateFAQ), faq.upsert);
router.put('/faq/:id', checkPermissionsMW(Action.EditFAQ), faq.upsert);
router.delete('/faq/:id', checkPermissionsMW(Action.DeleteFAQ), faq.remove);

export default router;
