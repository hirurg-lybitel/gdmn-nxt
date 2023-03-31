import express from 'express';
import cards from '../../kanban/cards';

const router = express.Router();

router.post('/cards', cards.upsert);
router.put('/cards/:id', cards.upsert);
router.delete('/cards/:id', cards.remove);

export default router;
