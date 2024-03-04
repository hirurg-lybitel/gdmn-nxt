import express from 'express';
import { contractsController } from '../controllers/contracts';

const router = express.Router();
// router.get('/contracts-list/:companyId/contractType/:contractType', contractsController.getAllByCustomer);
// router.get('/contracts-list?companyId=:companyId&contractType=:contractType', contractsController.getAllByCustomer);
router.get('/contracts-list/contractType/:contractType', contractsController.getAll);

export default router;
