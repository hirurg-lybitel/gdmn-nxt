import { expensesController } from '@gdmn-nxt/modules/expenses/controller';
import express from 'express';
import { getRemainsInvoices } from '../../controllers/remainInvoices';
import { getTopEarning } from '../../controllers/reports/topEarning';
import { getReconciliationStatement } from '../../reconciliationStatement';
import { expectedReceiptsController } from '@gdmn-nxt/modules/expected-receipts/controller';
import { expectedReceiptsDevController } from '@gdmn-nxt/modules/expected-receipts-dev/controller';
import { debtsController } from '@gdmn-nxt/modules/debts/controller';
import { revenueController } from '@gdmn-nxt/modules/revenues/controller';

const router = express.Router();

router.get('/debts/:dateBegin-:dateEnd', debtsController.findAll);
router.get('/expenses/:dateBegin-:dateEnd', expensesController.findAll);
router.get('/expected-receipts/:dateBegin-:dateEnd', expectedReceiptsController.findAll);
router.get('/expected-receipts-dev/:dateBegin-:dateEnd', expectedReceiptsDevController.findAll);
router.get('/revenue/:dateBegin-:dateEnd', revenueController.findAll);
router.get('/reconciliation-statement/:dateBegin-:dateEnd', getReconciliationStatement);
router.get('/remains-by-invoices/:onDate', getRemainsInvoices);
router.post('/topEarning', getTopEarning);

export default router;
