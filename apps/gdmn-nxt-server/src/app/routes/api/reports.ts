import express from 'express';
import { getRemainsInvoices } from '../../handlers/remainInvoices';
import { getReconciliationStatement } from '../../reconciliationStatement';

const router = express.Router();

router.get('/reconciliation-statement/:custId/:dateBegin-:dateEnd', getReconciliationStatement);
router.get('/remains-by-invoices/:onDate', getRemainsInvoices);

export default router;
