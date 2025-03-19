import { FindHandler, IExpense } from '@gsbelarus/util-api-types';
import { acquireReadTransaction } from '@gdmn-nxt/db-connection';

const find: FindHandler<IExpense> = async (
  sessionID,
  clause
) => {
  const dateBegin = clause['dateBegin'];
  const dateEnd = clause['dateEnd'];

  const { fetchAsObject, releaseReadTransaction } = await acquireReadTransaction(sessionID);

  try {
    const sql = `
      SELECT
        COALESCE(e.USR$NAME, 'Прочее') AS EXPENSENAME,
        SUM(bsl.DSUMNCU) AS AMOUNT,
        SUM(
          bsl.DSUMNCU / (
            SELECT
              VAL
            FROM GD_CURRRATE
            WHERE FORDATE <= doc.DOCUMENTDATE
              AND FROMCURR = 200020
              AND TOCURR = 200010
            ORDER BY FORDATE DESC
            ROWS 1
          )
        ) AS VALAMOUNT
      FROM
        BN_BANKSTATEMENT bs
      LEFT JOIN
        GD_DOCUMENT doc ON doc.ID = bs.DOCUMENTKEY
      LEFT JOIN
        BN_BANKSTATEMENTLINE bsl ON bsl.BANKSTATEMENTKEY = doc.ID
      LEFT JOIN
        USR$ACC_EXPENSES e ON e.ID = bsl.USR$GS_EXPENSESKEY
      WHERE
        doc.DOCUMENTDATE BETWEEN :dateBegin AND :dateEnd
        AND bsl.DSUMNCU > 0
      GROUP BY
        EXPENSENAME
      ORDER BY
        EXPENSENAME
      `;

    const data = await fetchAsObject<any>(sql, { dateBegin, dateEnd });

    const result: IExpense[] = data.map(expence => ({
      expenseName: expence['EXPENSENAME'],
      amount: expence['AMOUNT'],
      valAmount: expence['VALAMOUNT']
    }));

    return result;
  } finally {
    await releaseReadTransaction();
  }
};

export const expensesRepository = {
  find
};
