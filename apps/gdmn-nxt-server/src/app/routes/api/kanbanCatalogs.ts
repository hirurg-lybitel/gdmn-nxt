import express from 'express';
import { denyReasons } from '../../controllers/deals/denyReasons';
import { sourceCatalog } from '../../controllers/deals/sourceCatalog';
import { taskTypesController } from '../../controllers/tasks/taskTypes';
import { documentsCatalog } from '../../controllers/deals/documents';

const router = express.Router();

/** Источник заявок */
router.get('/dealsource', sourceCatalog.get);
router.post('/dealsource', sourceCatalog.upsert);
router.put('/dealsource/:id', sourceCatalog.upsert);
router.delete('/dealsource/:id', sourceCatalog.remove);

/** Причины отказа */
router.get('/denyreasons', denyReasons.get);
router.post('/denyreasons', denyReasons.upsert);
router.put('/denyreasons/:id', denyReasons.upsert);
router.delete('/denyreasons/:id', denyReasons.remove);

/** Типы задач */
router.get('/tasktypes', taskTypesController.get);
router.post('/tasktypes', taskTypesController.upsert);
router.put('/tasktypes/:id', taskTypesController.upsert);
router.delete('/tasktypes/:id', taskTypesController.remove);

/** Список документов */
router.get('/documents/:id', documentsCatalog.get);

export default router;
