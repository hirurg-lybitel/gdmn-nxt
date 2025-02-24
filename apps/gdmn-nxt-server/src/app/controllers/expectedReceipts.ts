import { IRequestResult, IContract } from '@gsbelarus/util-api-types';
import { parseIntDef } from '@gsbelarus/util-useful';
import { RequestHandler } from 'express';
import { resultError } from '../responseMessages';
import { acquireReadTransaction } from '@gdmn-nxt/db-connection';

export const getExpectedReceipts: RequestHandler = async (req, res) => {
  const dateBegin = new Date(parseIntDef(req.params.dateBegin, new Date().getTime()));
  const dateEnd = new Date(parseIntDef(req.params.dateEnd, new Date().getTime()));
  const perTimePaymentСontractTypeID = 358056837; // id вида договора с почасовой оплатой
  const fixedPaymentСontractTypeID = 358056835; // id вида договора с фиксированной оплатой
  const contractTypeId = -1; // id типа догоора на абонентское обслуживание
  const serviceId = []; // id услуг по обслуживанию ПО

  const { fetchAsObject, releaseReadTransaction } = await acquireReadTransaction(req.sessionID);

  try {
    let sql = `
      SELECT
        con.ID as CUSTOMER_ID,
        con.NAME as CUSTOMER_NAME,
        h.USR$BASEVALUE,
        doc.ID,
        (select SUM(l.USR$SUMNCU) from usr$bnf_contractline l where l.MASTERKEY = h.DOCUMENTKEY) as SUMNCU,
        (select SUM(l.USR$SUMCURR) from usr$bnf_contractline l where l.MASTERKEY = h.DOCUMENTKEY) as SUMCURNCU,
        kind.ID as KINDID
      FROM usr$bnf_contract h
        LEFT JOIN gd_document doc ON doc.id = h.DOCUMENTKEY
        LEFT JOIN gd_contact con ON con.id = h.usr$contactkey
        LEFT JOIN USR$GS_CONTRACTKIND kind on kind.ID = h.USR$CONTRACTKINDKEY
      ORDER BY
        doc.DOCUMENTDATE asc
    `;

    // WHERE h.USR$FROMDATE BETWEEN :dateBegin AND :dateEnd
    // OR h.USR$EXPIRYDATE BETWEEN :dateBegin AND :dateEnd
    // AND h.USR$TYPECONTRACTKEY = contractTypeId


    // Получение договоров за период
    const data = await fetchAsObject<IContract>(sql, { dateBegin, dateEnd });

    const sortedData = {};

    // Сортировка договоров по ID клиента
    data.forEach(c => {
      if (sortedData[c['CUSTOMER_ID']]) {
        sortedData[c['CUSTOMER_ID']].push(c);
      } else {
        sortedData[c['CUSTOMER_ID']] = [c];
      }
    });

    sql = `SELECT
      cl.MASTERKEY,
      cl.DOCUMENTKEY ID,
      good.NAME,
      cl.USR$QUANTITY QUANTITY,
      cl.USR$COST PRICE,
      cl.USR$SUMNCU AMOUNT
    FROM USR$BNF_CONTRACTLINE cl
      JOIN GD_GOOD good ON good.ID = cl.USR$BENEFITSNAME
    ORDER BY
      cl.MASTERKEY, good.NAME`;

    // WHERE cl.USR$BENEFITSNAME = serviceId

    // Получение услуг(Обслуживание ПО) договора
    const datails = await fetchAsObject(sql);

    const sortedDetails = {};

    // Сортировка услуг по ключу чтобы потом получить услуги договора по id(MASTERKEY)
    datails.forEach(d => {
      if (sortedDetails[d['MASTERKEY']]) {
        sortedDetails[d['MASTERKEY']].push(d);
      } else {
        sortedDetails[d['MASTERKEY']] = [d];
      }
    });

    sql = `SELECT
      USR$CONTRACT,
      DOCUMENTKEY
    FROM USR$BNF_ACTS
    `;

    // WHERE USR$BEGINDATE BETWEEN :dateBegin AND :dateEnd
    // OR USR$ENDDATE BETWEEN :dateBegin AND :dateEnd

    // Получение актов ыполненных работ за период
    const acts = await fetchAsObject(sql);

    const sortedActs = {};

    // Сортировка актов чтобы потом получить акты договора по id(USR$CONTRACT)
    acts.forEach(a => {
      if (sortedActs[a['USR$CONTRACT']]) {
        sortedActs[a['USR$CONTRACT']].push(a);
      } else {
        sortedActs[a['USR$CONTRACT']] = [a];
      }
    });

    sql = `SELECT
      USR$QUANTITY,
      USR$COST,
      MASTERKEY
    FROM USR$BNF_ACTSLINE
    `;

    // WHERE USR$BENEFITSNAME = serviceId

    // Получение услуг акта
    const actsLines = await fetchAsObject(sql);

    const sortedActsLines = {};

    // Сортировка услуг чтобы потом получить услуги акта по id(MASTERKEY)
    actsLines.forEach(a => {
      if (sortedActsLines[a['MASTERKEY']]) {
        sortedActsLines[a['MASTERKEY']].push(a);
      } else {
        sortedActsLines[a['MASTERKEY']] = [a];
      }
    });

    const calculateFullMonthsBetweenDates = (date1, date2) => {
      const startDate = new Date(date1);
      const endDate = new Date(date2);

      const yearsDifference = endDate.getFullYear() - startDate.getFullYear();
      const monthsDifference = endDate.getMonth() - startDate.getMonth();

      return yearsDifference * 12 + monthsDifference + 1;
    };

    const months = calculateFullMonthsBetweenDates(dateBegin, dateEnd);

    const contracts = Object.values(sortedData).map((contracts: any[]) => {
      const perTimeContract = contracts.find(contract => contract.KINDID === perTimePaymentСontractTypeID);
      const perMouthContract = contracts.find(contract => contract.KINDID === fixedPaymentСontractTypeID);
      const perTimeContractDetails = perTimeContract && sortedDetails[perTimeContract?.ID];
      const contractActs = perTimeContract && sortedActs[perTimeContract.ID];
      const contractsActLines = contractActs && contractActs.map((act: any) => sortedActsLines?.[act.DOCUMENTKEY]);
      const contractsActLinesSum = { quantitySum: 0, USR$COSTSUM: 0, linesCount: 0 };

      contractsActLines?.forEach(actLines => {
        actLines?.forEach(actLine => {
          contractsActLinesSum.quantitySum += actLine['USR$QUANTITY'];
          contractsActLinesSum.USR$COSTSUM += actLine['USR$COST'];
          contractsActLinesSum.linesCount += 1;
        });
      });

      const perHour = contractsActLinesSum.USR$COSTSUM / contractsActLinesSum.linesCount;
      const hoursAvarage = contractsActLinesSum.quantitySum / months;

      return {
        customer: {
          ID: contracts[0]['CUSTOMER_ID'],
          NAME: contracts[0]['CUSTOMER_NAME']
        },
        respondents: [],
        count: (perTimeContract ? 1 : 0) + (perMouthContract ? 1 : 0),
        perTimePayment: {
          baseValues: hoursAvarage,
          perHour: perHour,
          hoursAvarage: Number((hoursAvarage).toFixed(2)),
          amount: perHour * hoursAvarage
        },
        fixedPayment: {
          baseValues: perMouthContract?.['USR$BASEVALUE'],
          amount: perMouthContract?.SUMNCU
        },
        workstationPayment: {
          count: perTimeContractDetails?.[0]?.['QUANTITY'],
          baseValues: perTimeContractDetails?.[0]?.['PRICE'],
          amount: perTimeContractDetails?.[0]?.['AMOUNT']
        },
        amount: (perTimeContract?.SUMNCU ?? 0) + (perMouthContract?.SUMNCU ?? 0),
        valAmount: (perTimeContract?.SUMCURNCU ?? 0) + (perMouthContract?.SUMCURNCU ?? 0)
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
