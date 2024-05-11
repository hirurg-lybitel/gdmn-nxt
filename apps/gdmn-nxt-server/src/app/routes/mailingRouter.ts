import express from 'express';
import { segmentsController } from '@gdmn-nxt/controllers/segments';
import { mailingController } from '@gdmn-nxt/controllers/mailing';

const router = express.Router();
router.get('/marketing/segments', segmentsController.getAll);

router.get('/marketing/mailing', mailingController.findAll);
router.get('/marketing/mailing/:id', mailingController.findOne);
router.post('/marketing/mailing', mailingController.createMailing);
router.put('/marketing/mailing/:id', mailingController.updateById);
router.post('/marketing/mailing/launch/:id', mailingController.launchMailing);
router.delete('/marketing/mailing/:id', mailingController.removeById);

export const marketingRouter = router;
