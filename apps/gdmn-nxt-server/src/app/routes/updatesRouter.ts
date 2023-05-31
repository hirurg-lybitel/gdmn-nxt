import express from 'express';
import { updatesController } from '../controllers/updates';

const router = express.Router();

router.get('/updates', updatesController.get);
router.post('/updates', updatesController.upsert);
router.put('/updates/:id', updatesController.upsert);
router.delete('/updates/:id', updatesController.remove);

export default router;
