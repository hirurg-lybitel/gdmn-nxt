import express from 'express';
import cards from '../../controllers/kanban/cards';
import columns from '../../controllers/kanban/columns';
import kanban from '../../controllers/kanban/kanban';
import history from '../../controllers/kanban/history';
import tasks from '../../controllers/kanban/task';
import denyReasons from '../../controllers/kanban/denyReasons';
import { sourceCatalog } from '../../controllers/deals/sourceCatalog';
import kanbanCatalogs from './kanbanCatalogs';
import kanbanFilters from './kanbanFilters';

const router = express.Router();

router.get('/data/:mode', kanban.get);
router.get('/data/:mode?userID=:userID', kanban.get);
router.put('/reordercolumns', kanban.reorderColumns);
router.put('/reordercards', kanban.reorderCards);

router.post('/columns', columns.upsert);
router.put('/columns/:id', columns.upsert);
router.delete('/columns/:id', columns.remove);

router.get('/cards', cards.get);
router.get('/cards/:id', cards.get);
router.post('/cards', cards.upsert);
router.put('/cards/:id', cards.upsert);
router.delete('/cards/:id', cards.remove);

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
