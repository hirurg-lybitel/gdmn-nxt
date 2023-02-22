import { Action } from './../../../../../libs/util-api-types/src/lib/crmDataTypes';
import { checkPermissionsMW } from './../middlewares/middlewares';
import express from 'express';
import labels from '../handlers/labels';

const router = express.Router();
router.get('/labels', labels.get);
router.get('/labels/:id', labels.get);
router.post('/labels', checkPermissionsMW(Action.CreateLabel), labels.upsert);
router.put('/labels/:id', checkPermissionsMW(Action.EditLabel), labels.upsert);
router.delete('/labels/:id', checkPermissionsMW(Action.DeleteLabel), labels.remove);

export default router;
