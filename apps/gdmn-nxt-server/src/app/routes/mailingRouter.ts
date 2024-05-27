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

router.get('/mailing', mailingController.findAll);
router.get('/mailing/:id', mailingController.findOne);
router.post('/mailing', mailingController.createMailing);
router.put('/mailing/:id', mailingController.updateById);
router.post('/mailing/launch/:id', mailingController.launchMailing);
router.delete('/mailing/:id', mailingController.removeById);

router.get('/templates', templatesController.findAll);
router.get('/templates/:id', templatesController.findOne);
router.post('/templates', templatesController.createTemplate);
router.put('/templates/:id', templatesController.updateById);
router.delete('/templates/:id', templatesController.removeById);

export const marketingRouter = parentRouter;
