import express from 'express';
import { filters } from '../../handlers/deals/filters';

const router = express.Router();

router.get('/deadline', filters.getFilters);
router.get('/deadline/:userId', filters.getLastFilter);
router.post('/deadline/:userId', filters.upsertLastFilter);

export default router;
