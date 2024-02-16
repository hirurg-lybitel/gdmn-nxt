import express from 'express';
import { contractsController } from '../controllers/contractsList';

const router = express.Router();
router.get('/contracts-list/:companyId/contractType/:contractType', contractsController.getAllByCustomer);

export default router;
