import express from 'express';
import cards from '../../kanban/cards';
import columns from '../../kanban/columns';
import kanban from '../../kanban/kanban';
import history from '../../kanban/history';
import tasks from '../../kanban/task';
import denyReasons from '../../kanban/denyReasons';


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

router.get('/denyreasons', denyReasons.get);

export default router;
