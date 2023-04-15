import express from 'express';
import contractsList from '../controllers/contractsList';

const router = express.Router();
router.get('/contracts-list/:companyId', contractsList.get);

export default router;
