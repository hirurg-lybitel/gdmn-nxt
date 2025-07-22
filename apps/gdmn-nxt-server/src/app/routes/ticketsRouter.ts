import express from 'express';
import { ticketsController } from '@gdmn-nxt/modules/tickets/controller';
import { ticketsStatesController } from '@gdmn-nxt/modules/tickets-state/controller';

const router = express.Router();

router.get('/tickets', ticketsController.findAll);
router.get('/tickets/:id', ticketsController.findOne);
router.post('/tickets', ticketsController.createTicket);
router.put('/tickets/:id', ticketsController.updateById);

router.get('/tickets-states', ticketsStatesController.findAll);
router.get('/tickets-states/:id', ticketsStatesController.findOne);

export const ticketsRouter = router;
