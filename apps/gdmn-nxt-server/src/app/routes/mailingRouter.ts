import express from 'express';
import { templatesController } from '@gdmn-nxt/modules/marketing/templates/controller';
import { segmentsController } from '@gdmn-nxt/modules/marketing/segments/controller';
import { mailingController } from '@gdmn-nxt/modules/marketing/mailing/controller';

const router = express.Router();
const parentRouter = express.Router();
parentRouter.use('/marketing', router);

router.get('/segments', segmentsController.findAll);
router.get('/segments/:id', segmentsController.findOne);
router.post('/segments', segmentsController.createSegment);
router.put('/segments/:id', segmentsController.updateById);
router.delete('/segments/:id', segmentsController.removeById);
router.post('/segments/calc', segmentsController.calcCustomersCount);
router.post('/segments/customers', segmentsController.findCustomersBySegment);

router.get('/mailings', mailingController.findAll);
router.get('/mailings/:id', mailingController.findOne);
router.post('/mailings', mailingController.createMailing);
router.put('/mailings/:id', mailingController.updateById);
router.post('/mailings/launch/:id', mailingController.launchMailing);
router.delete('/mailings/:id', mailingController.removeById);
router.post('/mailings/launch-test', mailingController.testLaunchMailing);
router.get('/mailings/history/:mailingId', mailingController.getMailingHistory);

router.get('/templates', templatesController.findAll);
router.get('/templates/:id', templatesController.findOne);
router.post('/templates', templatesController.createTemplate);
router.put('/templates/:id', templatesController.updateById);
router.delete('/templates/:id', templatesController.removeById);

export const marketingRouter = parentRouter;
