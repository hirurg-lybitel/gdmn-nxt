import express from 'express';
import { denyReasons } from '../../handlers/deals/denyReasons';
import { sourceCatalog } from '../../handlers/deals/sourceCatalog';

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

export default router;
