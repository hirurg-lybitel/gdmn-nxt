import express from 'express';
import { ticketsController } from '@gdmn-nxt/modules/tickets/controller';
import { ticketsStatesController } from '@gdmn-nxt/modules/tickets-state/controller';
import { ticketsMessagesController } from '@gdmn-nxt/modules/tickets-messages/controller';
import { ticketsUserController } from '@gdmn-nxt/modules/tickets-user/controller';

const router = express.Router();
const parentRouter = express.Router();
parentRouter.use('/ticketSystem', router);

router.get('/tickets', ticketsController.findAll);
router.get('/tickets/:id', ticketsController.findOne);
router.post('/tickets', ticketsController.createTicket);
router.put('/tickets/:id', ticketsController.updateById);

router.get('/states', ticketsStatesController.findAll);
router.get('/states/:id', ticketsStatesController.findOne);

router.get('/messages/:ticketId', ticketsMessagesController.findAll);
router.post('/messages', ticketsMessagesController.createMessage);
router.put('/messages/:id', ticketsMessagesController.updateById);
router.delete('/messages/:id', ticketsMessagesController.removeById);

router.get('/users', ticketsUserController.findAll);
router.post('/users', ticketsUserController.create);
router.delete('/users/:id', ticketsUserController.removeById);

export const ticketsRouter = parentRouter;
