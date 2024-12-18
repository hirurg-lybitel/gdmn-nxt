import { acquireReadTransaction } from '@gdmn-nxt/db-connection';
import { FindHandler } from '@gsbelarus/util-api-types';

const find: FindHandler<{ customerId: number, amount: number }> = async (sessionID) => {
  const { fetchAsObject, releaseReadTransaction } = await acquireReadTransaction(sessionID);
  try {
    const rows = await fetchAsObject(`
      SELECT
        e.USR$GS_CUSTOMER,
        SUM(e.debitncu - e.creditncu) as saldo
      FROM ac_entry e
      WHERE e.ACCOUNTKEY = 366200
      GROUP BY 1
      HAVING SUM(e.debitncu - e.creditncu) > 0
      `);

    return rows.map(row => ({ customerId: row['USR$GS_CUSTOMER'], amount: row['SALDO'] }));
  } finally {
    await releaseReadTransaction();
  }
};

export const debtsRepository = {
  find,
};
