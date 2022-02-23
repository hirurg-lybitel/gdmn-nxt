import express from 'express';
import cards from '../../kanban/cards';
import columns from '../../kanban/columns';
import kanban from '../../kanban/kanban';


const router = express.Router();

router.get('/data/:mode', kanban.get);
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

export default router;
