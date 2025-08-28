import { FindHandler, IRevenue } from '@gsbelarus/util-api-types';
import { acquireReadTransaction } from '@gdmn-nxt/db-connection';

const find: FindHandler<IRevenue> = async (
  sessionID,
  clause
) => {
  const dateBegin = clause['dateBegin'];
  const dateEnd = clause['dateEnd'];
  const groupByOrganization = clause['groupByOrganization'];
  const customer = clause['customer'];

  const { fetchAsObject, releaseReadTransaction } = await acquireReadTransaction(sessionID);

  const numberFix = (number: number) => {
    return Number((number ?? 0).toFixed());
  };
  const accountKey51 = 355100;
  const accountKey62 = 366200;
  const accountKey90 = 344600;
  try {
    const sql = `
      SELECT
        c.ID,
        c.NAME,
        e.ENTRYDATE,
        SUM(e.DEBITNCU) as amount,
        SUM(
          e.DEBITNCU / CAST((
            SELECT
              VAL
            FROM GD_CURRRATE
            WHERE FORDATE <= e.ENTRYDATE
              AND FROMCURR = 200020
              AND TOCURR = 200010
            ORDER BY FORDATE DESC
            ROWS 1
          ) AS NUMERIC(18,2))
        ) AS amount_Currency
      FROM
        AC_ENTRY e
      JOIN
        GD_CONTACT c ON c.ID = e.USR$GS_CUSTOMER
      WHERE
        e.ACCOUNTKEY = ${accountKey51} AND
        e.ENTRYDATE BETWEEN :dateBegin AND :dateEnd
        ${customer ? 'AND c.ID = :customer' : ''}
        AND EXISTS (
          SELECT 1
          FROM AC_ENTRY ec
          WHERE ec.RECORDKEY = e.RECORDKEY
            AND ec.ACCOUNTPART = 'C'
            AND ec.ACCOUNTKEY IN (${accountKey62}, ${accountKey90})
        )
      GROUP BY
        c.NAME,
        c.ID,
        e.ENTRYDATE
      HAVING
        SUM(e.DEBITNCU) > 0
      ORDER BY
        c.NAME,
        e.ENTRYDATE
    `;

    const data = await fetchAsObject<any>(sql, { dateBegin, dateEnd, customer });

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      const numberFix = (number: number) => number < 10 ? `0${number}` : number;

      return `${numberFix(day)}.${numberFix(month)}.${year}`;
    };

    const result: IRevenue[] = (() => {
      const revenueParse = (revenue: any) => ({
        customer: {
          NAME: revenue['NAME'],
          ID: revenue['ID']
        },
        date: formatDate(revenue['ENTRYDATE']),
        amount: numberFix(revenue['AMOUNT']),
        amountCurrency: numberFix(revenue['AMOUNT_CURRENCY'])
      });

      if (groupByOrganization) {
        const sortRevenues: { [key: string]: IRevenue[]; } = {};
        data.forEach(revenue => {
          if (sortRevenues[revenue['ID']]) {
            sortRevenues[revenue['ID']].push(revenue);
          } else {
            sortRevenues[revenue['ID']] = [revenue];
          }
        });
        return Object.values(sortRevenues).map(revenues => {
          const revenue = revenues.reduce((count, item) => ({
            ...item,
            AMOUNT: (count['AMOUNT'] ?? 0) + (item['AMOUNT'] ?? 0),
            AMOUNT_CURRENCY: (count['AMOUNT_CURRENCY'] ?? 0) + (item['AMOUNT_CURRENCY'] ?? 0)
          }));
          return revenueParse(revenue);
        });
      }
      return data.map(revenueParse);
    })();

    return result;
  } finally {
    await releaseReadTransaction();
  }
};

export const revenueRepository = {
  find
};
