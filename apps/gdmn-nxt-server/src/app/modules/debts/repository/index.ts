import { FindHandler, IDebt } from '@gsbelarus/util-api-types';
import { acquireReadTransaction } from '@gdmn-nxt/db-connection';

const find: FindHandler<IDebt> = async (
  sessionID,
  clause
) => {
  const dateBegin = clause['dateBegin'];
  const dateEnd = clause['dateEnd'];

  const { fetchAsObject, releaseReadTransaction } = await acquireReadTransaction(sessionID);

  const numberFix = (number: number) => {
    return Number((number ?? 0).toFixed());
  };

  try {
    const sql = `
      SELECT
        con.ID,
        con.NAME,
        SUM(IIF(e.ENTRYDATE < :dateBegin, e.DEBITNCU - e.CREDITNCU, 0)) AS SaldoBegin,
        SUM(
          IIF(e.ENTRYDATE < :dateBegin, e.DEBITNCU - e.CREDITNCU, 0) / CAST((
            SELECT
              VAL
            FROM GD_CURRRATE
            WHERE FORDATE <= e.ENTRYDATE
              AND FROMCURR = 200020
              AND TOCURR = 200010
            ORDER BY FORDATE DESC
            ROWS 1
          ) AS NUMERIC(18,2))
        ) AS ValSaldoBegin,
        SUM(e.DEBITNCU - e.CREDITNCU) AS SaldoEnd,
        SUM(
          (e.DEBITNCU - e.CREDITNCU) / CAST((
            SELECT
              VAL
            FROM GD_CURRRATE
            WHERE FORDATE <= e.ENTRYDATE
              AND FROMCURR = 200020
              AND TOCURR = 200010
            ORDER BY FORDATE DESC
            ROWS 1
          ) AS NUMERIC(18,2))
        ) AS ValSaldoEnd,
        SUM(IIF(e.ENTRYDATE >= :dateBegin AND e.ENTRYDATE <= :dateEnd, e.DEBITNCU, 0)) AS Debit,
        SUM(IIF(e.ENTRYDATE >= :dateBegin AND e.ENTRYDATE <= :dateEnd, e.CREDITNCU, 0)) AS Credit
      FROM
        AC_ENTRY e
      JOIN
        GD_CONTACT con ON con.ID = e.USR$GS_CUSTOMER
      WHERE
        e.ACCOUNTKEY IN (366200, 875553347) AND
        e.ENTRYDATE <= :dateEnd
      GROUP BY
        con.ID,
        con.NAME
      HAVING
        SUM(IIF(e.ENTRYDATE < :dateBegin, e.DEBITNCU - e.CREDITNCU, 0)) > 0 OR
        SUM(IIF(e.ENTRYDATE >= :dateBegin AND e.ENTRYDATE <= :dateEnd, e.DEBITNCU, 0)) > 0 OR
        SUM(IIF(e.ENTRYDATE >= :dateBegin AND e.ENTRYDATE <= :dateEnd, e.CREDITNCU, 0)) > 0 OR
        SUM(e.DEBITNCU - e.CREDITNCU) > 0
      ORDER BY
        con.NAME
    `;

    const data = await fetchAsObject<any>(sql, { dateBegin, dateEnd });

    const calcChange = (saldoBegin: number, saldoEnd: number) => {
      const difference = saldoEnd - saldoBegin;
      if (!difference) return 0;
      return Number(((difference / saldoBegin) * 100).toFixed(2));
    };

    const result: IDebt[] = data.map(debt => ({
      customer: {
        ID: debt['ID'],
        NAME: debt['NAME']
      },
      saldoBegin: {
        value: debt['SaldoBegin'],
        currency: debt['ValSaldoBegin']
      },
      saldoEnd: {
        value: debt['SaldoEnd'],
        currency: debt['ValSaldoEnd']
      },
      done: debt['Debit'],
      paid: debt['Credit'],
      change: calcChange(debt['SaldoBegin'], debt['SaldoEnd'])
    }));

    return result;
  } finally {
    await releaseReadTransaction();
  }
};

export const debtsRepository = {
  find
};
