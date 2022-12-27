import express from 'express';
import faq from '../handlers/faq';

const router = express.Router();
router.get('/faq', faq.get);
router.post('/faq', faq.post);
// router.get('/labels/:id', labels.get);
// router.post('/labels', labels.upsert);
router.put('/faq', faq.put);
router.delete('/faq', faq.remove);

export default router;
