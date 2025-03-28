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
  const endsInPeriod = clause['endsInPeriod'];
  const inculdeFreezing = clause['inculdeFreezing'];

  const contractTypeId = [154913797, 987283565]; // ruid типа договора на разработку
  const filedState = [155412701, 1751673956]; // ruid статуса договора подшит
  const annulledState = [257953333, 1751673956];// ruid статуса договора анулированно

  const { fetchAsObject, releaseReadTransaction, blob2String } = await acquireReadTransaction(sessionID);

  try {
    let sql = `
    SELECT
      con.ID AS CUSTOMER_ID,
      con.NAME AS CUSTOMER_NAME,
      h.USR$FROMDATE,
      h.USR$EXPIRYDATE,
      h.USR$CONTRACTTEXT,
      stateRuid.XID AS STATE_XID,
      stateRuid.DBID AS STATE_DBID,
      doc.ID AS CONTRACTID,
      doc.NUMBER AS NUMBER,
      doc.DOCUMENTDATE AS DOCUMENTDATE,
      SUM(COALESCE(cl.USR$SUMNCU, cl.USR$SUMCURR * CAST(rate.VAL AS NUMERIC(18, 2)))) AS AMOUNT,
      SUM(COALESCE(cl.USR$SUMNCU / CAST(rate.VAL AS NUMERIC(18, 2)), cl.USR$SUMCURR)) AS AMOUNT_VAL
    FROM usr$bnf_contract h
      LEFT JOIN gd_document doc ON doc.id = h.DOCUMENTKEY
      LEFT JOIN gd_contact con ON con.id = h.usr$contactkey
      LEFT JOIN gd_ruid ruid ON ruid.id = h.USR$TYPECONTRACTKEY
      LEFT JOIN gd_ruid stateRuid ON stateRuid.id = h.USR$STATEKEY
      LEFT JOIN USR$BNF_CONTRACTLINE cl ON cl.MASTERKEY = doc.ID
      LEFT JOIN (
        SELECT
          docInner.ID AS DOC_ID,
          (SELECT VAL
            FROM GD_CURRRATE
            WHERE FORDATE <= docInner.DOCUMENTDATE
              AND FROMCURR = 200020
              AND TOCURR = 200010
            ORDER BY FORDATE DESC
            ROWS 1
          ) AS VAL
        FROM gd_document docInner
        ) rate ON rate.DOC_ID = doc.ID
    WHERE
      ${endsInPeriod ? 'h.USR$EXPIRYDATE BETWEEN :dateBegin AND :dateEnd' : 'h.USR$FROMDATE <= :dateEnd AND :dateBegin <= h.USR$EXPIRYDATE'}
      AND ruid.XID = :contractTypeXID AND ruid.DBID = :contractTypeDBID
      AND NOT (stateRuid.XID = ${annulledState[0]} AND stateRuid.DBID = ${annulledState[1]})
    GROUP BY
      con.ID, con.NAME, h.USR$FROMDATE, h.USR$EXPIRYDATE,
      h.USR$CONTRACTTEXT, stateRuid.XID, stateRuid.DBID,
      doc.ID, doc.NUMBER, doc.DOCUMENTDATE
    `;

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
      const expired = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
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
        const planned = contract['STATE_XID'] === filedState[0] && contract['STATE_DBID'] === filedState[1];

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
          ) AS AMOUNT_VAL,
          MAX(ac.USR$PAYMENTDATE) AS LASTACT
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
          SUM(bsl.CSUMNCU) as AMOUNT,
          SUM(bsl.CSUMNCU /
          (
            SELECT
              VAL
            FROM GD_CURRRATE
            WHERE FORDATE <= d.DOCUMENTDATE
              AND FROMCURR = 200020
              AND TOCURR = 200010
            ORDER BY FORDATE DESC
            ROWS 1
          )) AS AMOUNT_VAL,
          MAX(d.DOCUMENTDATE) AS LASTPAYMENT
        FROM BN_BANKSTATEMENTLINE bsl
          LEFT JOIN gd_document d ON d.id = bsl.id
        WHERE bsl.USR$BN_CONTRACTKEY = :contractId
        GROUP BY d.DOCUMENTDATE
        `;

        const paid = (await fetchAsObject<IContract>(sql, { contractId: contract['CONTRACTID'] }))[0];

        const rest = planned ? (contract?.['AMOUNT'] ?? 0) / 2 : (contract?.['AMOUNT'] ?? 0) - (paid?.['AMOUNT'] ?? 0);

        const lastAct = done?.['LASTACT'] ? new Date(done?.['LASTACT']) : new Date();
        const lastPayment = paid?.['LASTPAYMENT'] ? new Date(paid?.['LASTPAYMENT']) : new Date();
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
        twoYearsAgo.setDate(twoYearsAgo.getDate() - 1);

        const feezing = lastAct < twoYearsAgo || lastPayment < twoYearsAgo;

        if ((rest < 1 && !includeZeroRest) || (feezing && !inculdeFreezing)) continue;

        clientContracts.push({
          customer: {
            ID: contracts[0]['CUSTOMER_ID'],
            NAME: contracts[0]['CUSTOMER_NAME']
          },
          number: `№ ${contract?.['NUMBER']} ${formatDate(contract?.['DOCUMENTDATE'])} `,
          dateBegin: formatDate(contract?.['USR$FROMDATE']),
          dateEnd: formatDate(contract?.['USR$EXPIRYDATE']),
          expired: planned ? undefined : expiredCalc(contract?.['USR$EXPIRYDATE']),
          planned: planned,
          subject: await blob2String(contract?.['USR$CONTRACTTEXT']),
          amount: {
            value: numberFix(contract?.['AMOUNT']),
            currency: numberFix(contract?.['AMOUNT_VAL'])
          },
          done: planned ? undefined : {
            value: numberFix(done?.['AMOUNT']),
            currency: numberFix(done?.['AMOUNT_VAL'])
          },
          paid: planned ? undefined : {
            value: numberFix(paid?.['AMOUNT']),
            currency: numberFix(paid?.['AMOUNT_VAL'])
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
