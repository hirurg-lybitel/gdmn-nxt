import express from 'express';
import { feedbackController } from '@gdmn-nxt/modules/feedback/controller';

const router = express.Router();

router.get('/feedback/customerId/:customerId', feedbackController.findByCustomer);
router.post('/feedback', feedbackController.createFeedback);
router.put('/feedback/:id', feedbackController.updateById);
router.delete('/feedback/:id', feedbackController.removeById);

export const feedbackRouter = router;

