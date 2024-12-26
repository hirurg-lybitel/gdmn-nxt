import { acquireReadTransaction } from '@gdmn-nxt/db-connection';
import { FindHandler } from '@gsbelarus/util-api-types';
import { prepareClause } from '@gsbelarus/util-helpers';

const find: FindHandler<{ customerId: number, amount: number }> = async (sessionID, clause) => {
  const { fetchAsObject, releaseReadTransaction } = await acquireReadTransaction(sessionID);
  try {
    const { clauseString } = prepareClause(clause);

    const rows = await fetchAsObject(`
      SELECT
        z.USR$GS_CUSTOMER,
        SUM(z.debitncu - z.creditncu) as saldo
      FROM ac_entry z
      WHERE z.ACCOUNTKEY = 366200
      ${clauseString}
      GROUP BY 1
      HAVING SUM(z.debitncu - z.creditncu) > 0
      `);

    return rows.map(row => ({ customerId: row['USR$GS_CUSTOMER'], amount: row['SALDO'] }));
  } finally {
    await releaseReadTransaction();
  }
};

export const debtsRepository = {
  find,
};
