import { acquireReadTransaction } from '@gdmn-nxt/db-connection';
import { ContractType, FindHandler, IContract } from '@gsbelarus/util-api-types';

const find: FindHandler<IContract> = async (sessionID, clause = {}) => {
  const { fetchAsObject, releaseReadTransaction } = await acquireReadTransaction(sessionID);

  const defaultClause = {
    documentTypeKey: 154758289,
  };

  const clauseString = Object
    .keys({ ...defaultClause, ...clause })
    .filter(f => f.toLowerCase() !== 'contracttype')
    .map(f => ` ${f === 'documentTypeKey' ? 'doc' : 'h'}.${f} = :${f.toString().replace('usr$', '')}`)
    .join(' AND ');

  const preparedClause = {
    ...defaultClause,
    ...clause
  };

  Object.keys(preparedClause).forEach(key => {
    const newKey = key.replace('usr$', '');
    if (newKey === key) return;
    preparedClause[newKey] = preparedClause[key];
    delete preparedClause[key];
  });

  try {
    const sql = (() => {
      switch (clause?.['contractType'] ?? 1) {
        case ContractType.GS:
          return `
          SELECT
            doc.ID,
            doc.DOCUMENTDATE,
            doc.NUMBER,
            IIF(h.USR$EXPIRYDATE > CURRENT_DATE, 1, 0) ISACTIVE,
            0 as ISBUDGET,
            h.USR$FROMDATE DATEBEGIN,
            h.USR$EXPIRYDATE DATEEND,
            doctype.USR$NAME as doctypename,
            '' as DEPT_NAME,
            0 as JOB_NUMBER,
            (select SUM(l.USR$SUMNCU) from usr$bnf_contractline l where l.MASTERKEY = h.DOCUMENTKEY) as SUMNCU,
            (select SUM(l.USR$SUMCURR) from usr$bnf_contractline l where l.MASTERKEY = h.DOCUMENTKEY) as SUMCURNCU
            FROM usr$bnf_contract h
              LEFT JOIN gd_document doc ON doc.id = h.DOCUMENTKEY
              LEFT JOIN gd_contact con ON con.id = h.usr$contactkey
              LEFT JOIN gd_companycode cc ON con.id = cc.companykey
              LEFT JOIN gd_company comp ON con.id = comp.contactkey
              LEFT JOIN USR$MGAZ_TYPECONTRACT  doctype on doctype.ID = h.USR$TYPECONTRACTKEY
              LEFT JOIN gd_curr curr on curr.ID = h.USR$CURRKEY
              LEFT JOIN USR$GS_CONTRACTKIND kind on kind.ID = h.USR$CONTRACTKINDKEY
            ${clauseString.length > 0 ? `WHERE ${clauseString}` : ''}
          ORDER BY
            doc.DOCUMENTDATE desc
        `;
        case ContractType.BG:
          return `
          SELECT
            doc.ID,
            doc.DOCUMENTDATE,
            doc.NUMBER,
            c.USR$ACTIVE ISACTIVE,
            c.USR$BUDGET ISBUDGET,
            dep.name as DEPT_NAME,
            job.USR$NUMBER as JOB_NUMBER,
            c.USR$SUMM SUMNCU,
            c.USR$CURR SUMCURNCU,
            c.USR$DATEBEGIN DATEBEGIN,
            c.USR$DATEEND DATEEND
          FROM
            USR$BG_CONTRACT c
            left join gd_document doc on c.DOCUMENTKEY = doc.id
            LEFT JOIN gd_contact con ON con.id = c.USR$CUSTOMER
            left join gd_contact dep on dep.ID = c.USR$CONTACTKEY
            left join usr$bg_contractjob job on job.ID = c.USR$CONTRACTJOBKEY
            left join gd_curr curr on curr.ID = c.USR$CURRCODE
          ${clauseString.length > 0 ? `WHERE ${clauseString}` : ''}
          ORDER BY
            doc.DOCUMENTDATE DESC`;
      }
    })();

    const contracts = await fetchAsObject<IContract>(sql, preparedClause);

    return contracts;
  } finally {
    releaseReadTransaction();
  }
};

export const contractsRepository = {
  find
};
