import express from 'express';
import { getRemainsInvoices } from '../../controllers/remainInvoices';
import { getTopEarning } from '../../controllers/reports/topEarning';
import { getReconciliationStatement } from '../../reconciliationStatement';
import { expectedReceiptsController } from '@gdmn-nxt/modules/expected-receipts/controller';
import { expectedReceiptsDevController } from '@gdmn-nxt/modules/expected-receipts-dev/controller';

const router = express.Router();

router.get('/expected-receipts/:dateBegin-:dateEnd', expectedReceiptsController.findAll);
router.get('/expected-receipts-dev/:dateBegin-:dateEnd', expectedReceiptsDevController.findAll);
router.get('/reconciliation-statement/:custId/:dateBegin-:dateEnd', getReconciliationStatement);
router.get('/remains-by-invoices/:onDate', getRemainsInvoices);
router.post('/topEarning', getTopEarning);

export default router;
