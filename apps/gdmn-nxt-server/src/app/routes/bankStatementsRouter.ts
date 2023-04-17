import express from 'express';
import bankStatements from '../controllers/reports/bankStatements';

const router = express.Router();
router.get('/bank-statement/:companyId', bankStatements.get);

export default router;
