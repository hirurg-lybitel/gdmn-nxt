import express from 'express';
import { ticketsController } from '@gdmn-nxt/modules/tickets/controller';

const router = express.Router();

router.get('/tickets', ticketsController.findAll);
router.get('/tickets/:id', ticketsController.findOne);
router.post('/tickets', ticketsController.createTicket);
router.put('/tickets/:id', ticketsController.updateById);

export const ticketsRouter = router;
