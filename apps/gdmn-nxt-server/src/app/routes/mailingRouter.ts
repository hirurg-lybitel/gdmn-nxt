import express from 'express';
import { segmentsController } from '@gdmn-nxt/controllers/segments';
import { mailingController } from '@gdmn-nxt/controllers/mailing';

const router = express.Router();
router.get('/marketing/segments', segmentsController.getAll);

router.get('/marketing/mailing', mailingController.getAll);
router.get('/marketing/mailing/launch/:id', mailingController.launchMailing);

export const marketingRouter = router;
