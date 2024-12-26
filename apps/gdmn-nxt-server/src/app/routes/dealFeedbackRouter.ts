import express from 'express';
import { dealFeedbackController } from '@gdmn-nxt/modules/deal-feedback/controller';
import { dealFeedbackCatalogsController } from '@gdmn-nxt/modules/deal-feedback/controller/catalogs';

const router = express.Router();

router.get('/deal-feedback/dealId/:dealId', dealFeedbackController.findByDeal);
router.post('/deal-feedback', dealFeedbackController.createFeedback);
router.put('/deal-feedback/:id', dealFeedbackController.updateById);
router.delete('/deal-feedback/:id', dealFeedbackController.removeById);

/** Catalogs */
router.get('/deal-feedback/catalogs/results', dealFeedbackCatalogsController.findAllResults);
router.get('/deal-feedback/catalogs/competences', dealFeedbackCatalogsController.findAllCompetences);
router.get('/deal-feedback/catalogs/satisfactions', dealFeedbackCatalogsController.findAllSatisfactions);
router.get('/deal-feedback/catalogs/satisfactionRates', dealFeedbackCatalogsController.findAllSatisfactionRates);

export const dealFeedbackRouter = router;

