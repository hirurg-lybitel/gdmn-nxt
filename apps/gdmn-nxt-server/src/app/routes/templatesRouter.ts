import express from 'express';
import { templatesController } from '@gdmn-nxt/controllers/templates';

const router = express.Router();

router.get('/templates', templatesController.get);
router.get('/templates/:id', templatesController.get);
router.post('/templates', templatesController.upsert);
router.put('/templates/:id', templatesController.upsert);
router.delete('/templates/:id', templatesController.remove);


export default router;
