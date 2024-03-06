import express from 'express';
import { contractsController } from '../controllers/contracts/contracts';
import { contractDetailsController } from '@gdmn-nxt/controllers/contracts/contractDetails';

const router = express.Router();
// router.get('/contracts-list/:companyId/contractType/:contractType', contractsController.getAllByCustomer);
// router.get('/contracts-list?companyId=:companyId&contractType=:contractType', contractsController.getAllByCustomer);
router.get('/contracts-list/contractType/:contractType', contractsController.getAll);
router.get('/contracts-list/contractType/:contractType/details/:contractId', contractDetailsController.getByContract);

export default router;
