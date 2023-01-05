import express from 'express';
import faq from '../handlers/faq';

const router = express.Router();
router.get('/faq', faq.get);
router.get('/faq/:id', faq.get);
router.post('/faq', faq.upsert);
router.put('/faq/:id', faq.upsert);
router.delete('/faq/:id', faq.remove);

export default router;
