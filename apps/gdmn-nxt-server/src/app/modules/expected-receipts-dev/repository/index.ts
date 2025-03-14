import { FindHandler, IContract, IExpectedReceiptDev, IExpectedReceiptDevContract } from '@gsbelarus/util-api-types';
import { acquireReadTransaction } from '@gdmn-nxt/db-connection';

const find: FindHandler<IExpectedReceiptDev> = async (
  sessionID,
  clause
) => {
  const dateBegin = clause['dateBegin'];
  const dateEnd = clause['dateEnd'];
  const includeZeroRest = clause['includeZeroRest'];
  const includePlanned = clause['includePlanned'];

  const contractTypeId = [154913797, 987283565]; // ruid типа договора на разработку
  const filedState = [155412701, 1751673956]; // ruid статуса договора подшит
  const { fetchAsObject, releaseReadTransaction, blob2String } = await acquireReadTransaction(sessionID);

  try {
    let sql = `
    SELECT
      con.ID as CUSTOMER_ID,
      con.NAME as CUSTOMER_NAME,
      h.USR$FROMDATE,
      h.USR$EXPIRYDATE,
      h.USR$CONTRACTTEXT,
      SUM(cl.USR$SUMNCU) as AMOUNT,
      SUM(cl.USR$SUMNCU) /
      (
        SELECT
          VAL
        FROM GD_CURRRATE
        WHERE FORDATE <= MAX(doc.DOCUMENTDATE)
          AND FROMCURR = 200020
          AND TOCURR = 200010
        ORDER BY FORDATE DESC
        ROWS 1
      ) AS AMOUNT_VAL,
      stateRuid.XID as STATE_XID,
      stateRuid.DBID as STATE_DBID,
      MAX(doc.ID) as CONTRACTID,
      MAX(doc.NUMBER) as NUMBER,
      MAX(doc.DOCUMENTDATE) as DOCUMENTDATE
    FROM usr$bnf_contract h
      LEFT JOIN gd_document doc ON doc.id = h.DOCUMENTKEY
      LEFT JOIN gd_contact con ON con.id = h.usr$contactkey
      LEFT JOIN gd_ruid ruid ON ruid.id = h.USR$TYPECONTRACTKEY
      LEFT JOIN gd_ruid stateRuid ON stateRuid.id = h.USR$STATEKEY
      LEFT JOIN USR$BNF_CONTRACTLINE cl ON cl.MASTERKEY = doc.ID
    WHERE
      h.USR$FROMDATE <= :dateEnd AND :dateBegin <= h.USR$EXPIRYDATE
      AND ruid.XID = :contractTypeXID AND ruid.DBID = :contractTypeDBID
    GROUP BY
      con.ID, con.NAME, h.USR$FROMDATE, h.USR$EXPIRYDATE, h.USR$CONTRACTTEXT,
      stateRuid.XID, stateRuid.DBID
    ORDER BY
      MAX(doc.DOCUMENTDATE) DESC`;

    // Получение договоров за период
    const data = await fetchAsObject<IContract>(sql, { dateBegin, dateEnd, contractTypeXID: contractTypeId[0], contractTypeDBID: contractTypeId[1] });

    // Сортировка договоров по ID клиента
    const sortedData = {};
    data.forEach(c => {
      if (sortedData[c['CUSTOMER_ID']]) {
        sortedData[c['CUSTOMER_ID']].push(c);
      } else {
        sortedData[c['CUSTOMER_ID']] = [c];
      }
    });

    const expiredCalc = (date: string) => {
      const dateEnd = new Date(date);
      const now = new Date();
      const timeDifference = now.getTime() - dateEnd.getTime();
      const expired = Number((timeDifference / (1000 * 60 * 60 * 24)).toFixed());
      if (expired < 0) return 0;
      return expired;
    };

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      const numberFix = (number: number) => number < 10 ? `0${number}` : number;

      return `${numberFix(day)}.${numberFix(month)}.${year}`;
    };

    sql = `SELECT
    VAL
    FROM GD_CURRRATE
    WHERE FORDATE <= :dateEnd AND FROMCURR = 200020 AND TOCURR = 200010
    ORDER BY
      FORDATE desc
    `;

    // Ближайший курс валюты на последнюю дату периода
    const currrate = (await fetchAsObject(sql, { dateEnd }))[0]['VAL'];


    const numberFix = (number: number) => {
      return Number((number ?? 0).toFixed());
    };

    const clients: IExpectedReceiptDev[] = [];

    const sortedClients: any[] = Object.values(sortedData);

    for (const contracts of sortedClients) {
      const clientContracts: IExpectedReceiptDevContract[] = [];

      for (const contract of contracts) {
        // Оплнируемый договор
        const planned = !((contract['STATE_XID'] === filedState[0] && contract['STATE_DBID'] === filedState[1]));

        if (planned && !includePlanned) continue;

        let sql = `
        SELECT
          SUM(al.USR$SUMNCU) as AMOUNT,
          SUM(al.USR$SUMNCU) /
          (
            SELECT
              VAL
            FROM GD_CURRRATE
            WHERE FORDATE <= ac.USR$PAYMENTDATE
              AND FROMCURR = 200020
              AND TOCURR = 200010
            ORDER BY FORDATE DESC
            ROWS 1
          ) AS AMOUNT_VAL
        FROM
          USR$BNF_ACTS ac
        LEFT JOIN
          USR$BNF_ACTSLINE al ON al.MASTERKEY = ac.DOCUMENTKEY
        WHERE
          ac.USR$CONTRACT = :contractId
        GROUP BY
          ac.USR$PAYMENTDATE;
        `;

        // Сумма оплаты за выполненые работы по договору
        const done = planned ? undefined : (await fetchAsObject<IContract>(sql, { contractId: contract['CONTRACTID'] }))[0];

        sql = `
        SELECT
          SUM(CSUMNCU) as AMOUNT
        FROM BN_BANKSTATEMENTLINE bs
          LEFT JOIN gd_document d ON l.id = d.id
        WHERE bs.COMPANYKEY = :contactId and bs.USR$BN_CONTRACTKEY = :contractId
        `;

        const paid = (await fetchAsObject<IContract>(sql, { contractId: contract['CONTRACTID'] }))[0];

        const rest = planned ? contract['AMOUNT'] / 2 : 0;

        if (rest < 1 && !includeZeroRest) continue;

        clientContracts.push({
          customer: {
            ID: contracts[0]['CUSTOMER_ID'],
            NAME: contracts[0]['CUSTOMER_NAME']
          },
          number: `№ ${contract['NUMBER']} ${formatDate(contract['DOCUMENTDATE'])} `,
          dateBegin: formatDate(contract['USR$FROMDATE']),
          dateEnd: formatDate(contract['USR$EXPIRYDATE']),
          expired: planned ? undefined : expiredCalc(contract['USR$EXPIRYDATE']),
          planned: planned,
          subject: await blob2String(contract['USR$CONTRACTTEXT']),
          amount: {
            value: numberFix(contract['AMOUNT']),
            currency: numberFix(contract['AMOUNT_VAL'])
          },
          done: planned ? undefined : {
            value: numberFix(done?.['AMOUNT']),
            currency: numberFix(done?.['AMOUNT_VAL'])
          },
          paid: planned ? undefined : {
            value: paid['AMOUNT'],
            currency: 0
          },
          rest: {
            value: numberFix(rest),
            currency: numberFix(rest / currrate)
          }
        });
      }

      if (clientContracts.length === 0) continue;

      clients.push({
        customer: {
          ID: contracts[0]['CUSTOMER_ID'],
          NAME: contracts[0]['CUSTOMER_NAME']
        },
        contracts: clientContracts
      });
    };

    return clients;
  } finally {
    await releaseReadTransaction();
  }
};

export const expectedReceiptsDevRepository = {
  find
};
