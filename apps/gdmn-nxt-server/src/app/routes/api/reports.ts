import express from 'express';
import { getRemainsInvoices } from '../../controllers/remainInvoices';
import { getTopEarning } from '../../controllers/reports/topEarning';
import { getReconciliationStatement } from '../../reconciliationStatement';
import { getExpectedReceipts } from '@gdmn-nxt/controllers/expectedReceipts';

const router = express.Router();

router.get('/expected-receipts/:dateBegin-:dateEnd', getExpectedReceipts);
router.get('/reconciliation-statement/:custId/:dateBegin-:dateEnd', getReconciliationStatement);
router.get('/remains-by-invoices/:onDate', getRemainsInvoices);
router.post('/topEarning', getTopEarning);

export default router;
