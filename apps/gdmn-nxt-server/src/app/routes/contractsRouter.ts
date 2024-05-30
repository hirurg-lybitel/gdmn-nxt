import { contractsController } from '@gdmn-nxt/modules/contracts/controller';
import express from 'express';

const router = express.Router();
// router.get('/contracts-list/:companyId/contractType/:contractType', contractsController.getAllByCustomer);
// router.get('/contracts-list?companyId=:companyId&contractType=:contractType', contractsController.getAllByCustomer);
router.get('/contracts-list/contractType/:contractType', contractsController.getAll);
router.get('/contracts-list/contractType/:contractType/details/:contractId', contractsController.getDetailByContract);

export default router;
