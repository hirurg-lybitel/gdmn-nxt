import express from 'express';
import bankStatements from '../bankStatements';

const router = express.Router();
router.get('/bank-statement/:companyId', bankStatements.get);

export default router;