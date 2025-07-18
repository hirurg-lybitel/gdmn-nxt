import express from 'express';
import { ticketsController } from '@gdmn-nxt/modules/tickets/controller';

const router = express.Router();

router.get('/tickets', ticketsController.findAll);
router.post('/tickets', ticketsController.createTicket);
// router.get('/tickets/:entityName', filtersController.findAll);
// router.put('/tickets/:id', filtersController.updateById);
// router.delete('/tickets/:id', filtersController.removeById);

export const ticketsRouter = router;
