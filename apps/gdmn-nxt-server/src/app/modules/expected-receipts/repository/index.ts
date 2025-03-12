import { Customer } from '@gdmn-nxt/server/utils/cachedRequests';
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

  // ruid переодичностей выставления и функция корректировки суммы
  const actPeriodicity = [
    { XID: 147071927, DBID: 141260635, action: (amount: number) => amount }, // месяц
    { XID: 147071929, DBID: 141260635, action: (amount: number) => amount / 12 }, // год
    { XID: 147071928, DBID: 141260635, action: (amount: number) => amount / 3 }, // квартал
    { XID: 147071926, DBID: 141260635, action: (amount: number) => amount }, // неделя
    { XID: 147071925, DBID: 141260635, action: (amount: number) => amount }, // день
    { XID: 147071930, DBID: 141260635, action: (amount: number) => amount }, // произвольный
  ];

  const serviceRuidToRequest = (fieldName: string) => {
    let request = '';
    serviceId.forEach(s => {
      request += (request === '' ? '' : ' OR ') + `${fieldName}.XID = ${s[0]} AND ${fieldName}.DBID = ${s[1]}`;
    });
    return request;
  };

  const { fetchAsObject, releaseReadTransaction } = await acquireReadTransaction(sessionID);

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

    const numberFix = (number: number) => {
      return Number((number ?? 0).toFixed());
    };

    const contracts: IExpectedReceipt[] = [];

    const clients: any[][] = Object.values(sortedData);

    for (const contractsEls of clients) {
      // Договоры с клиентом
      const [fixedPaymentContracts, perTimeContracts] = (() => {
        const fixed = [];
        const perTime = [];
        contractsEls.forEach((contract) => {
          if ((contract['KXID'] === fixedPaymentСontractTypeID[0] && contract['KDBID'] === fixedPaymentСontractTypeID[1])
            || (!contract['KXID'] && !contract['KDBID'])
          ) {
            fixed.push(contract);
          }
          if (contract['KXID'] === perTimePaymentСontractTypeID[0]
            && contract['KDBID'] === perTimePaymentСontractTypeID[1]) {
            perTime.push(contract);
          }
        });
        return [fixed, perTime];
      })();

      // Преобразование id догооров в условие поиска
      const contractsIds = (() => {
        let str = '';
        perTimeContracts.forEach((contract, index) => {
          if (!contract?.ID) return '';
          str += `${str.length > 0 ? ' OR ' : 'WHERE '}cl.masterkey = ${contract.ID}`;
          return str;
        });
        return str;
      })();

      // Получение сумм по позициям договоров
      sql = `SELECT
        SUM(COALESCE(cl.USR$COSTBV * cl.USR$QUANTITY * COALESCE(CAST(cv.constvalue AS NUMERIC(18, 2)), 1), cl.USR$SUMNCU)) AS AMOUNT,
        SUM(cl.USR$QUANTITY) as QUANTITY
      FROM USR$BNF_CONTRACTLINE cl
      LEFT JOIN (
        SELECT cv.CONSTKEY, cv.constvalue
        FROM GD_CONSTVALUE cv
        LEFT JOIN gd_ruid ruid ON ruid.XID = 147035098 AND ruid.DBID = 9802323
        LEFT JOIN GD_CONST c ON c.id = ruid.id
        WHERE cv.CONSTDATE <= :dateEnd AND cv.CONSTKEY = c.id
        ORDER BY cv.CONSTDATE DESC
        ROWS 1
      ) cv ON cv.constvalue != 0
      ${contractsIds}
      `;

      const perTimeContractDetailsSum = contractsIds !== '' ? (await fetchAsObject(sql, { dateEnd }))[0] : undefined;

      // Акты выполненых работ договоров на повременную оплату
      const contractsActLines = await (async () => {
        let actsCount = [];
        for (const contract of perTimeContracts) {
          const sql = `SELECT
            al.USR$QUANTITY,
            al.USR$COST,
            al.MASTERKEY
          FROM USR$BNF_ACTSLINE al
            LEFT JOIN USR$BNF_ACTS ac ON USR$BEGINDATE <= :dateEnd AND :dateBegin <= USR$ENDDATE AND USR$CONTRACT = :contractId
          WHERE al.MASTERKEY = ac.DOCUMENTKEY
          `;
          const acts = await fetchAsObject(sql, { dateBegin, dateEnd, contractId: contract?.ID });
          actsCount = actsCount.concat(acts);
        };
        return actsCount;
      })();

      const contractsActLinesSum = { quantitySum: 0, costsum: null };
      let lastQuantity = 0;

      includePerTime && contractsActLines?.forEach(actLine => {
        contractsActLinesSum.quantitySum += actLine['USR$QUANTITY'];
        contractsActLinesSum.costsum = lastQuantity === 0 ? (contractsActLinesSum.costsum ?? actLine['USR$COST'])
          : ((contractsActLinesSum.costsum * lastQuantity) + (actLine['USR$COST'] * actLine['USR$QUANTITY'])) / (lastQuantity + actLine['USR$QUANTITY']);
        lastQuantity = actLine['USR$QUANTITY'];
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
      const fixedPaymentAmount = await (async () => {
        let sum = 0;

        for (const contract of fixedPaymentContracts) {
          const sql = `SELECT
            apRuid.XID as APXID,
            apRuid.DBID as APDBID
          FROM USR$BNF_CONTRACTLINE cl
            LEFT JOIN gd_ruid apRuid ON apRuid.ID = cl.USR$ACTPERIODICITY
          WHERE cl.masterkey = :contractId`;

          // Получение позиций договора
          const datails = await fetchAsObject(sql, { contractId: contract.ID });

          const periodicityСorrectionFun = (actPeriodicity.find(item => datails?.[0]?.['APXID'] === item.XID
            && datails?.[0]?.['APDBID'] === item.DBID)?.action) ?? function (amount: number) {
            return amount;
          };
          sum += periodicityСorrectionFun((contract?.['USR$BASEVALUE'] ? contract?.['USR$BASEVALUE'] * baseValue : contract?.SUMNCU ?? 0));
        };
        return sum;
      })();

      const workstationAmount = perTimeContractDetailsSum?.['AMOUNT'] ?? 0;
      const perTimeAmount = contractsActLinesSum.costsum * hoursAvarage;
      const amount = (includePerTime ? perTimeAmount : 0) + workstationAmount + fixedPaymentAmount;

      const contract: IExpectedReceipt = {
        customer: {
          ID: contractsEls[0]['CUSTOMER_ID'],
          NAME: contractsEls[0]['CUSTOMER_NAME']
        },
        respondents: [],
        count: (perTimeContracts.length) + (fixedPaymentContracts.length),
        fixedPayment: {
          baseValues: fixedPaymentContracts.length > 0 && numberFix(fixedPaymentContracts?.reduce((count, item) => {
            return {
              ...item,
              USR$BASEVALUE: (count.USR$BASEVALUE ?? 0) + (item.USR$BASEVALUE ?? 0),
            };
          })?.['USR$BASEVALUE']),
          amount: numberFix(fixedPaymentAmount)
        },
        workstationPayment: perTimeContractDetailsSum && {
          count: numberFix(perTimeContractDetailsSum?.['QUANTITY']),
          baseValues: Number((workstationAmount / perTimeContractDetailsSum?.['QUANTITY'] / baseValue).toFixed(2)),
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

      if (contract.amount > 0 && contract.valAmount > 0) contracts.push(contract);;
    };

    return contracts;
  } finally {
    await releaseReadTransaction();
  }
};

export const expectedReceiptsRepository = {
  find
};
