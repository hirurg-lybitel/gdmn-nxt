import { IRequestResult, IContract } from '@gsbelarus/util-api-types';
import { parseIntDef } from '@gsbelarus/util-useful';
import { RequestHandler } from 'express';
import { resultError } from '../responseMessages';
import { acquireReadTransaction } from '@gdmn-nxt/db-connection';

export const getExpectedReceipts: RequestHandler = async (req, res) => {
  const dateBegin = new Date(parseIntDef(req.params.dateBegin, new Date().getTime()));
  const dateEnd = new Date(parseIntDef(req.params.dateEnd, new Date().getTime()));

  const { fetchAsObject, releaseReadTransaction, getIdByRUID } = await acquireReadTransaction(req.sessionID);

  try {
    const sql = `
      SELECT
        doc.ID,
        doc.DOCUMENTDATE,
        doc.NUMBER,
        IIF(CURRENT_DATE BETWEEN h.USR$FROMDATE AND h.USR$EXPIRYDATE, 1, 0) ISACTIVE,
        0 as ISBUDGET,
        h.USR$FROMDATE DATEBEGIN,
        h.USR$EXPIRYDATE DATEEND,
        doctype.USR$NAME as doctypename,
        '' as DEPT_NAME,
        0 as JOB_NUMBER,
        (select SUM(l.USR$SUMNCU) from usr$bnf_contractline l where l.MASTERKEY = h.DOCUMENTKEY) as SUMNCU,
        (select SUM(l.USR$SUMCURR) from usr$bnf_contractline l where l.MASTERKEY = h.DOCUMENTKEY) as SUMCURNCU,
        con.NAME as CUSTOMER_NAME,
        con.ID as CUSTOMER_ID
      FROM usr$bnf_contract h
        LEFT JOIN gd_document doc ON doc.id = h.DOCUMENTKEY
        LEFT JOIN gd_contact con ON con.id = h.usr$contactkey
        LEFT JOIN gd_companycode cc ON con.id = cc.companykey
        LEFT JOIN gd_company comp ON con.id = comp.contactkey
        LEFT JOIN USR$MGAZ_TYPECONTRACT  doctype on doctype.ID = h.USR$TYPECONTRACTKEY
        LEFT JOIN gd_curr curr on curr.ID = h.USR$CURRKEY
        LEFT JOIN USR$GS_CONTRACTKIND kind on kind.ID = h.USR$CONTRACTKINDKEY
        WHERE h.USR$FROMDATE BETWEEN :dateBegin AND :dateEnd
        OR h.USR$EXPIRYDATE BETWEEN :dateBegin AND :dateEnd
      ORDER BY
        doc.DOCUMENTDATE desc
    `;

    const data = await fetchAsObject<IContract>(sql, { dateBegin, dateEnd });

    const sortedData = {};

    data.forEach(c => {
      if (sortedData[c['CUSTOMER_ID']]) {
        sortedData[c['CUSTOMER_ID']].push(c);
      } else {
        sortedData[c['CUSTOMER_ID']] = [c];
      }
    });

    const contracts = Object.values(sortedData).map((contracts: any[]) => {
      const contract = contracts[contracts.length - 1];
      return {
        customer: {
          ID: contract['CUSTOMER_ID'],
          NAME: contract['CUSTOMER_NAME']
        },
        respondents: ['МИ', 'АВ', 'ЮР'],
        count: contracts.length,
        perMouthPayment: {
          baseValues: -1,
          amount: -1
        },
        workstationPayment: {
          count: -1,
          baseValues: -1,
          amount: -1
        },
        perTimePayment: {
          baseValues: -1,
          perHour: -1,
          hoursAvarage: -1,
          amount: -1
        },
        amount: contract.SUMNCU ?? 0,
        valAmount: contract.SUMCURNCU ?? 0
      };
    });

    const result: IRequestResult = {
      queries: {
        expectedReceipts: contracts
      },
      _params: [{ dateBegin: dateBegin, dateEnd: dateEnd }],
      _schema: {}
    };

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).send(resultError(error.message));
  } finally {
    await releaseReadTransaction();
  }
};
