import { IRequestResult, IContract } from '@gsbelarus/util-api-types';
import { parseIntDef } from '@gsbelarus/util-useful';
import { RequestHandler } from 'express';
import { resultError } from '../responseMessages';
import { acquireReadTransaction } from '@gdmn-nxt/db-connection';

export const getExpectedReceipts: RequestHandler = async (req, res) => {
  const dateBegin = new Date(parseIntDef(req.params.dateBegin, new Date().getTime()));
  const dateEnd = new Date(parseIntDef(req.params.dateEnd, new Date().getTime()));
  const perTimePaymentСontractTypeID = [764683309, 1511199483]; // ruid вида договора с почасовой оплатой
  const fixedPaymentСontractTypeID = [764683308, 1511199483]; // ruid вида договора с фиксированной оплатой
  const contractTypeId = [154913796, 747560394]; // ruid типа договора на абонентское обслуживание
  const serviceId = [
    [147100633, 17],
    [154265279, 17],
    [360427363, 1511199483],
    [360427364, 1511199483],
    [986962823, 119040821],
    [986962825, 119040821],
    [986962827, 119040821],
    [986962829, 119040821]
  ]; // ruid услуг по обслуживанию ПО


  const serviceRuidToRequest = (fieldName: string) => {
    let request = '';
    serviceId.forEach(s => {
      request += (request === '' ? '' : ' OR ') + `${fieldName}.XID = ${s[0]} AND ${fieldName}.DBID = ${s[1]}`;
    });
    return request;
  };

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
        kind.ID as KINDID,
        kruid.XID as KXID,
        kruid.DBID as KDBID
      FROM usr$bnf_contract h
        LEFT JOIN gd_document doc ON doc.id = h.DOCUMENTKEY
        LEFT JOIN gd_contact con ON con.id = h.usr$contactkey
        LEFT JOIN gd_companycode cc ON con.id = cc.companykey
        LEFT JOIN gd_company comp ON con.id = comp.contactkey
        LEFT JOIN USR$MGAZ_TYPECONTRACT  doctype on doctype.ID = h.USR$TYPECONTRACTKEY
        LEFT JOIN gd_curr curr on curr.ID = h.USR$CURRKEY
        LEFT JOIN USR$GS_CONTRACTKIND kind on kind.ID = h.USR$CONTRACTKINDKEY
        LEFT JOIN gd_ruid kruid ON kruid.id = kind.ID
        LEFT JOIN gd_ruid ruid ON ruid.id = h.USR$TYPECONTRACTKEY
      WHERE
        (h.USR$FROMDATE BETWEEN :dateBegin AND :dateEnd
        OR h.USR$EXPIRYDATE BETWEEN :dateBegin AND :dateEnd)
        AND ruid.XID = :contractTypeXID AND ruid.DBID = :contractTypeDBID
      ORDER BY
        doc.DOCUMENTDATE asc
    `;

    // Получение договоров за период
    const data = await fetchAsObject<IContract>(sql, { dateBegin, dateEnd, contractTypeXID: contractTypeId[0], contractTypeDBID: contractTypeId[1] });

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
      cl.USR$SUMNCU AMOUNT,
      cl.USR$COSTBV PRICEBV
    FROM USR$BNF_CONTRACTLINE cl
      JOIN GD_GOOD good ON good.ID = cl.USR$BENEFITSNAME
      LEFT JOIN gd_ruid ruid ON ruid.id = cl.USR$BENEFITSNAME
    ORDER BY
      cl.MASTERKEY, good.NAME`;

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
    WHERE USR$BEGINDATE BETWEEN :dateBegin AND :dateEnd
      OR USR$ENDDATE BETWEEN :dateBegin AND :dateEnd
    `;

    // Получение актов ыполненных работ за период
    const acts = await fetchAsObject(sql, { dateBegin, dateEnd });

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
      LEFT JOIN gd_ruid ruid ON ruid.id = USR$BENEFITSNAME
    `;

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

    const getMidpointDate = (date1, date2) => {
      const startDate = new Date(date1);
      const endDate = new Date(date2);

      const midpointTime = (startDate.getTime() + endDate.getTime()) / 2;

      const midpointDate = new Date(midpointTime);

      midpointDate.setDate(midpointDate.getDate() + 1);

      midpointDate.setUTCHours(0, 0, 0, 0);

      return midpointDate;
    };

    const midpointDate = new Date(getMidpointDate(dateBegin, dateEnd));

    sql = `SELECT
    VAL
    FROM GD_CURRRATE
    WHERE FORDATE <= :midpointDate AND FROMCURR = 200020
    ORDER BY
      FORDATE desc
    `;

    const currrate = (await fetchAsObject(sql, { midpointDate }))[0]['VAL'];

    const calculateFullMonthsBetweenDates = (date1, date2) => {
      const startDate = new Date(date1);
      const endDate = new Date(date2);

      const yearsDifference = endDate.getFullYear() - startDate.getFullYear();
      const monthsDifference = endDate.getMonth() - startDate.getMonth();

      return yearsDifference * 12 + monthsDifference + 1;
    };

    const months = calculateFullMonthsBetweenDates(dateBegin, dateEnd);

    const contracts = [];

    const detailsSum = (details: any[]) => {
      if (!details || details.length <= 0) return { QUANTITY: 0, AMOUNT: 0, PRICEBV: 0 };

      const sum = details.reduce((count, item) => {
        const lastBV = count.lastBV ?? details[0].PRICEBV ?? 0;

        return {
          ...item,
          QUANTITY: count.QUANTITY + item.QUANTITY,
          PRICEBV: lastBV === 0 ? (count.PRICEBV ?? item?.PRICEBV)
            : ((count.PRICEBV * lastBV) + (item?.PRICEBV * item.QUANTITY)) / (lastBV + item.QUANTITY),
          AMOUNT: count.AMOUNT + item.AMOUNT,
          lastBV: item?.PRICEBV || 0
        };
      });

      return { QUANTITY: sum.QUANTITY, AMOUNT: sum.AMOUNT, PRICEBV: sum.PRICEBV };
    };

    Object.values(sortedData).forEach((contractsEls: any[]) => {
      const perTimeContract = contractsEls.find(contract => contract['KXID'] === perTimePaymentСontractTypeID[0]
        && contract['KDBID'] === perTimePaymentСontractTypeID[1]
        && (contract['SUMNCU'] > 0 || contract['SUMCURNCU'] > 0)
      );
      const fixedPaymentContract = contractsEls.find(contract => contract['KXID'] === fixedPaymentСontractTypeID[0]
        && contract['KDBID'] === fixedPaymentСontractTypeID[1]
        && (contract['SUMNCU'] > 0 || contract['SUMCURNCU'] > 0)
      );
      const perTimeContractDetails = perTimeContract && sortedDetails[perTimeContract?.ID];
      const perTimeContractDetailsSum = detailsSum(perTimeContractDetails);
      const contractActs = perTimeContract && sortedActs[perTimeContract.ID];
      const contractsActLines = contractActs && contractActs.map((act: any) => sortedActsLines?.[act.DOCUMENTKEY]);

      const contractsActLinesSum = { quantitySum: 0, costsum: null };

      let lastQuantity = 0;

      contractsActLines?.forEach(actLines => {
        actLines?.forEach(actLine => {
          contractsActLinesSum.quantitySum += actLine['USR$QUANTITY'];
          contractsActLinesSum.costsum = lastQuantity === 0 ? (contractsActLinesSum.costsum ?? actLine['USR$COST'])
            : ((contractsActLinesSum.costsum * lastQuantity) + (actLine['USR$COST'] * actLine['USR$QUANTITY'])) / (lastQuantity + actLine['USR$QUANTITY']);
          lastQuantity = actLine['USR$QUANTITY'];
        });
      });

      const hoursAvarage = contractsActLinesSum.quantitySum / months;

      const amount = (fixedPaymentContract?.SUMNCU ?? 0) + (perTimeContractDetailsSum['AMOUNT'] ?? 0);

      const contract = {
        customer: {
          ID: contractsEls[0]['CUSTOMER_ID'],
          NAME: contractsEls[0]['CUSTOMER_NAME']
        },
        respondents: [],
        count: (perTimeContract ? 1 : 0) + (fixedPaymentContract ? 1 : 0),
        fixedPayment: {
          baseValues: fixedPaymentContract?.['USR$BASEVALUE'],
          amount: fixedPaymentContract?.SUMNCU
        },
        workstationPayment: {
          count: perTimeContractDetailsSum['QUANTITY'],
          baseValues: perTimeContractDetailsSum['PRICEBV'],
          amount: perTimeContractDetailsSum['AMOUNT']
        },
        perTimePayment: perTimeContract ? {
          baseValues: Number((perTimeContractDetailsSum['PRICEBV'] ?? 0).toFixed(2)),
          perHour: Number((contractsActLinesSum.costsum ?? 0).toFixed(2)),
          hoursAvarage: Number((hoursAvarage ?? 0).toFixed(2)),
          amount: Number((contractsActLinesSum.costsum * hoursAvarage).toFixed(2))
        } : {},
        amount: Number(amount.toFixed(2)),
        valAmount: Number((amount / currrate).toFixed(2))
      };

      if (contract.amount <= 0 && contract.valAmount <= 0) return;

      contracts.push(contract);
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
