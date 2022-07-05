import express from 'express';
import contractsList from '../handlers/contractsList';

const router = express.Router();
router.get('/contracts-list/:companyId', contractsList.get);

export default router;
