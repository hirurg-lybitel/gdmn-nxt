import express from 'express';
import cards from '../../controllers/kanban/cards';
import columns from '../../controllers/kanban/columns';
import history from '../../controllers/kanban/history';
import tasks from '../../controllers/kanban/task';
import kanbanCatalogs from './kanbanCatalogs';
import kanbanFilters from './kanbanFilters';
import { kanbanController } from '../../controllers/kanban/kanban';
import { cardStatusController } from '../../controllers/kanban/cardStatus';

const router = express.Router();

router.get('/data/deals', kanbanController.get);
router.get('/data/deals?userID=:userID', kanbanController.get);
router.put('/reordercolumns', kanbanController.reorderColumns);
router.put('/reordercards', kanbanController.reorderCards);

router.get('/data/tasks', kanbanController.getTasks);

router.post('/columns', columns.upsert);
router.put('/columns/:id', columns.upsert);
router.delete('/columns/:id', columns.remove);

router.get('/cards', cards.get);
router.get('/cards/:id', cards.get);
router.post('/cards', cards.upsert);
router.put('/cards/:id', cards.upsert);
router.delete('/cards/:id', cards.remove);

router.get('/cards/files/:id', cards.getFiles);

// router.get('/cards/status/:id', cardStatusController.get);
router.post('/cards/status/:id', cardStatusController.upsert);

router.get('/history', history.get);
router.get('/history/:cardId', history.get);
router.post('/history', history.add);

router.get('/tasks', tasks.get);
router.get('/tasks/:cardId', tasks.get);
router.post('/tasks', tasks.upsert);
router.put('/tasks/:id', tasks.upsert);
router.delete('/tasks/:id', tasks.remove);

/** Справочник источников сделки */
router.use('/catalogs', kanbanCatalogs);

/** Фильтры */
router.use('/filters', kanbanFilters);

export default router;
