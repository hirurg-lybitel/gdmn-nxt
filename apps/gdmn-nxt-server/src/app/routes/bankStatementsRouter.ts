import express from 'express';
import bankStatements from '../bankStatements';

const router = express.Router();
router.get('/bank-statement', bankStatements.get);
router.get('/bank-statement/:customerId', bankStatements.get);

export default router;