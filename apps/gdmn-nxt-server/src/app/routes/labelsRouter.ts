import express from 'express';
import { labelController } from '../controllers/labels';

const router = express.Router();

router.get('/labels', labelController.get);
router.get('/labels/:id', labelController.get);
router.post('/labels', labelController.upsert);
router.put('/labels/:id', labelController.upsert);
router.delete('/labels/:id', labelController.remove);

export default router;
