import { FindHandler, IContract, IExpectedReceiptDev } from '@gsbelarus/util-api-types';
import { acquireReadTransaction } from '@gdmn-nxt/db-connection';

const find: FindHandler<IExpectedReceiptDev> = async (
  sessionID,
  clause
) => {
  const dateBegin = clause['dateBegin'];
  const dateEnd = clause['dateEnd'];
  const includeZeroRest = clause['includeZeroRest'];

  const contractTypeId = [154913797, 987283565]; // ruid типа договора на разработку
  const filedState = [155412701, 1751673956]; // ruid статуса договора подшит
  const signedState = [-1, -1]; // ruid статуса договора подписан
  const { fetchAsObject, releaseReadTransaction } = await acquireReadTransaction(sessionID);

  try {
    const sql = `
      SELECT
        con.ID as CUSTOMER_ID,
        con.NAME as CUSTOMER_NAME,
        h.USR$FROMDATE,
        h.USR$EXPIRYDATE,
        h.USR$BASEVALUE,
        doc.ID,
        (select SUM(l.USR$SUMNCU) from usr$bnf_contractline l where l.MASTERKEY = h.DOCUMENTKEY) as SUMNCU,
        (select SUM(l.USR$SUMCURR) from usr$bnf_contractline l where l.MASTERKEY = h.DOCUMENTKEY) as SUMCURNCU,
        kind.ID as KINDID,
        kruid.XID as KXID,
        kruid.DBID as KDBID,
        stateRuid.XID as STATE_XID,
        stateRuid.DBID as STATE_DBID
      FROM usr$bnf_contract h
        LEFT JOIN gd_document doc ON doc.id = h.DOCUMENTKEY
        LEFT JOIN gd_contact con ON con.id = h.usr$contactkey
        LEFT JOIN USR$GS_CONTRACTKIND kind on kind.ID = h.USR$CONTRACTKINDKEY
        LEFT JOIN gd_ruid kruid ON kruid.id = kind.ID
        LEFT JOIN gd_ruid ruid ON ruid.id = h.USR$TYPECONTRACTKEY
        LEFT JOIN gd_ruid stateRuid ON stateRuid.id = h.USR$STATEKEY
      WHERE
        h.USR$FROMDATE <= :dateEnd AND :dateBegin <= h.USR$EXPIRYDATE
        AND ruid.XID = :contractTypeXID AND ruid.DBID = :contractTypeDBID
      ORDER BY
        doc.DOCUMENTDATE desc
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

    const clients: IExpectedReceiptDev[] = [];

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

      return `${day}.${month}.${year}`;
    };

    const sortedClients: any[] = Object.values(sortedData);

    for (const contracts of sortedClients) {
      clients.push({
        customer: {
          ID: contracts[0]['CUSTOMER_ID'],
          NAME: contracts[0]['CUSTOMER_NAME']
        },
        contracts: await Promise.all(contracts.map(async (contract) => {
          const sql = `SELECT
            cl.MASTERKEY,
            cl.DOCUMENTKEY ID,
            good.NAME,
            cl.USR$QUANTITY QUANTITY,
            cl.USR$COST PRICE,
            cl.USR$SUMNCU AMOUNT,
            cl.USR$COSTBV PRICEBV,
            apRuid.XID as APXID,
            apRuid.DBID as APDBID
          FROM USR$BNF_CONTRACTLINE cl
            JOIN GD_GOOD good ON good.ID = cl.USR$BENEFITSNAME
            LEFT JOIN gd_ruid ruid ON ruid.id = cl.USR$BENEFITSNAME
            LEFT JOIN gd_ruid apRuid ON apRuid.ID = cl.USR$ACTPERIODICITY
          WHERE cl.MASTERKEY = :contractId`;

          // Получение позиций договора
          const datails = await fetchAsObject(sql, { contractId: contract['ID'] });

          console.log(datails);

          const planned = !((contract['STATE_XID'] === filedState[0] && contract['STATE_DBID'] === filedState[1]) ||
          (contract['STATE_XID'] === signedState[0] && contract['STATE_DBID'] === signedState[1]));

          return {
            number: '№ 23 10.01.2010',
            dateBegin: formatDate(contract['USR$FROMDATE']),
            dateEnd: formatDate(contract['USR$EXPIRYDATE']),
            expired: planned ? 0 : expiredCalc(contract['USR$EXPIRYDATE']),
            planned: planned,
            subject: 'Автоматизация отгрузки',
            amount: {
              value: 100000,
              currency: 50000
            },
            done: {
              value: 0,
              currency: 0
            },
            paid: {
              value: 0,
              currency: 0
            },
            rest: {
              value: 100000,
              currency: 40000
            }
          };
        }))
      });
    };

    const testData: IExpectedReceiptDev[] = [{
      customer: {
        NAME: 'БМКК',
        ID: -1
      },
      contracts: [
        {
          number: '№ 23 10.01.2010',
          dateBegin: '16.01.2010',
          dateEnd: '30.06.2010',
          expired: 0,
          planned: false,
          subject: 'Автоматизация отгрузки',
          amount: {
            value: 100000,
            currency: 50000
          },
          done: {
            value: 0,
            currency: 0
          },
          paid: {
            value: 0,
            currency: 0
          },
          rest: {
            value: 100000,
            currency: 40000
          }
        },
        {
          number: '№ 23 10.01.2010',
          dateBegin: '16.01.2010',
          dateEnd: '30.06.2010',
          expired: 0,
          planned: false,
          subject: 'Автоматизация отгрузки',
          amount: {
            value: 100000,
            currency: 50000
          },
          done: {
            value: 0,
            currency: 0
          },
          paid: {
            value: 0,
            currency: 0
          },
          rest: {
            value: 100000,
            currency: 40000
          }
        }
      ]
    }];

    return clients;
  } finally {
    await releaseReadTransaction();
  }
};

export const expectedReceiptsDevRepository = {
  find
};
