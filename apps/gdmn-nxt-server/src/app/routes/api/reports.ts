import express from 'express';
import { getRemainsInvoices } from '../../controllers/remainInvoices';
import { getTopEarning } from '../../controllers/reports/topEarning';
import { getReconciliationStatement } from '../../reconciliationStatement';

const router = express.Router();

router.get('/reconciliation-statement/:custId/:dateBegin-:dateEnd', getReconciliationStatement);
router.get('/remains-by-invoices/:onDate', getRemainsInvoices);
router.post('/topEarning', getTopEarning);

export default router;
