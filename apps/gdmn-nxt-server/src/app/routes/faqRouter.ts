import express from 'express';
import { faqController } from '../controllers/faq';

const router = express.Router();

router.get('/faq', faqController.get);
router.get('/faq/:id', faqController.get);
router.post('/faq', faqController.upsert);
router.put('/faq/:id', faqController.upsert);
router.delete('/faq/:id', faqController.remove);

export default router;
