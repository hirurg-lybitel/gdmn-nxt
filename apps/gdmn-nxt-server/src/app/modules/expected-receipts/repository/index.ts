import { IContract, IExpectedReceipt, FindHandler } from '@gsbelarus/util-api-types';
import { acquireReadTransaction } from '@gdmn-nxt/db-connection';

const find: FindHandler<IExpectedReceipt> = async (
  sessionID,
  clause
) => {
  const dateBegin = clause['dateBegin'];
  const dateEnd = clause['dateEnd'];
  const includePerTime = clause['includePerTime'];
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

  const { fetchAsObject, releaseReadTransaction } = await acquireReadTransaction(sessionID);

  const baseValuesTable = [147035098, 9802323];

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

    // Сортировка услуг по ключу чтобы потом получить услуги договора по id(MASTERKEY)
    const sortedDetails = {};
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
    WHERE USR$BEGINDATE <= :dateEnd AND :dateBegin <= USR$ENDDATE
    `;

    // Получение актов выполненных работ за период
    const acts = await fetchAsObject(sql, { dateBegin, dateEnd });

    // Сортировка актов чтобы потом получить акты договора по id(USR$CONTRACT)
    const sortedActs = {};
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

    // Сортировка услуг чтобы потом получить услуги акта по id(MASTERKEY)
    const sortedActsLines = {};
    actsLines.forEach(a => {
      if (sortedActsLines[a['MASTERKEY']]) {
        sortedActsLines[a['MASTERKEY']].push(a);
      } else {
        sortedActsLines[a['MASTERKEY']] = [a];
      }
    });

    // Средняя дата между датами заданного периода
    const midpointDate = (() => {
      const startDate = new Date(dateBegin);
      const endDate = new Date(dateEnd);

      const midpointTime = (startDate.getTime() + endDate.getTime()) / 2;

      const midpointDate = new Date(midpointTime);

      midpointDate.setDate(midpointDate.getDate() + 1);

      midpointDate.setUTCHours(0, 0, 0, 0);

      return midpointDate;
    })();

    sql = `SELECT
    VAL
    FROM GD_CURRRATE
    WHERE FORDATE <= :midpointDate AND FROMCURR = 200020
    ORDER BY
      FORDATE desc
    `;

    // Курс валюты на среднюю дату между датами заданного периода
    const currrate = (await fetchAsObject(sql, { midpointDate }))[0]['VAL'];

    sql = `SELECT
      CONSTVALUE
    FROM GD_CONST c
      JOIN GD_CONSTVALUE cv ON cv.CONSTKEY = c.id
      LEFT JOIN gd_ruid ruid ON ruid.XID = 147035098 AND ruid.DBID = 9802323
    WHERE c.id = ruid.id AND cv.CONSTDATE <= :dateEnd
    ORDER BY cv.CONSTDATE desc
    `;

    // Базовая величина на конец периода
    const baseValue = (await fetchAsObject(sql, { dateEnd }))[0]['CONSTVALUE'];

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

    const numberFix = (number: number) => {
      return Number((number ?? 0).toFixed());
    };

    const contracts: IExpectedReceipt[] = [];

    Object.values(sortedData).forEach((contractsEls: any[]) => {
      // Ближайший договор с клиентом на повременную оплату
      const perTimeContract = contractsEls.find(contract => contract['KXID'] === perTimePaymentСontractTypeID[0]
        && contract['KDBID'] === perTimePaymentСontractTypeID[1]
        && (contract['SUMNCU'] > 0 || contract['SUMCURNCU'] > 0)
      );

      // Ближайший договор с клиентом на фиксированную оплату
      const fixedPaymentContract = contractsEls.find(contract => contract['KXID'] === fixedPaymentСontractTypeID[0]
        && contract['KDBID'] === fixedPaymentСontractTypeID[1]
        && (contract['SUMNCU'] > 0 || contract['SUMCURNCU'] > 0)
      );

      // Позиции договора на повременную оплату
      const perTimeContractDetails = perTimeContract && sortedDetails[perTimeContract?.ID];
      const perTimeContractDetailsSum = detailsSum(perTimeContractDetails);

      // Акты выполненых работ договора на повременную оплату
      const contractActs = perTimeContract && sortedActs[perTimeContract.ID];

      // Позиции актов выполненых работ договора на повременную оплату
      const contractsActLines = contractActs?.map((act: any) => sortedActsLines?.[act.DOCUMENTKEY]);
      const contractsActLinesSum = { quantitySum: 0, costsum: null };
      let lastQuantity = 0;

      includePerTime && contractsActLines?.forEach(actLines => {
        actLines?.forEach(actLine => {
          contractsActLinesSum.quantitySum += actLine['USR$QUANTITY'];
          contractsActLinesSum.costsum = lastQuantity === 0 ? (contractsActLinesSum.costsum ?? actLine['USR$COST'])
            : ((contractsActLinesSum.costsum * lastQuantity) + (actLine['USR$COST'] * actLine['USR$QUANTITY'])) / (lastQuantity + actLine['USR$QUANTITY']);
          lastQuantity = actLine['USR$QUANTITY'];
        });
      });

      // Количество месяцев в заданном периоде включая неполные
      const fullMonthsCount = (() => {
        const startDate = new Date(dateBegin);
        const endDate = new Date(dateEnd);

        const yearsDifference = endDate.getFullYear() - startDate.getFullYear();
        const monthsDifference = endDate.getMonth() - startDate.getMonth();

        return yearsDifference * 12 + monthsDifference + 1;
      })();

      // Часов среднемесячно
      const hoursAvarage = contractsActLinesSum.quantitySum / fullMonthsCount;

      // Расчет сумм по договорам
      const fixedPaymentAmount = (fixedPaymentContract?.['USR$BASEVALUE'] ?? 0) * baseValue;
      const workstationAmount = (perTimeContractDetailsSum['QUANTITY'] ?? 0) * (perTimeContractDetailsSum['PRICEBV'] ?? 1) * baseValue;
      const perTimeAmount = contractsActLinesSum.costsum * hoursAvarage;
      const amount = (includePerTime ? perTimeAmount : 0) + workstationAmount + fixedPaymentAmount;

      const contract: IExpectedReceipt = {
        customer: {
          ID: contractsEls[0]['CUSTOMER_ID'],
          NAME: contractsEls[0]['CUSTOMER_NAME']
        },
        respondents: [],
        count: (hoursAvarage ? 1 : 0) + (fixedPaymentContract ? 1 : 0),
        fixedPayment: {
          baseValues: numberFix(fixedPaymentContract?.['USR$BASEVALUE']),
          amount: numberFix(fixedPaymentAmount)
        },
        workstationPayment: {
          count: numberFix(perTimeContractDetailsSum['QUANTITY']),
          baseValues: numberFix(perTimeContractDetailsSum['PRICEBV']),
          amount: numberFix(workstationAmount)
        },
        perTimePayment: includePerTime && hoursAvarage ? {
          perHour: numberFix(contractsActLinesSum.costsum),
          hoursAvarage: numberFix(hoursAvarage),
          amount: numberFix(perTimeAmount)
        } : undefined,
        amount: numberFix(amount),
        valAmount: numberFix(amount / currrate)
      };

      if (contract.amount <= 0 && contract.valAmount <= 0) return;

      contracts.push(contract);
    });

    return contracts;
  } finally {
    await releaseReadTransaction();
  }
};

export const expectedReceiptsRepository = {
  find
};
