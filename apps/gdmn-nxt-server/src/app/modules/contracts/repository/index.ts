import { acquireReadTransaction } from '@gdmn-nxt/db-connection';
import { ContractType, FindHandler, FindOneHandler, IContract, RemoveHandler, SaveHandler, UpdateHandler } from '@gsbelarus/util-api-types';
import { forEachAsync } from '@gsbelarus/util-helpers';

const find: FindHandler<IContract> = async (sessionID, clause = {}) => {
  const { fetchAsObject, releaseReadTransaction, getIdByRUID } = await acquireReadTransaction(sessionID);

  const documentTypeKey = await (() => {
    switch (clause?.['contractType'] ?? ContractType.GS) {
      case ContractType.GS:
        return getIdByRUID(147071539, 141260635);
      case ContractType.BG:
        return getIdByRUID(148090064, 127352715);
      default:
        return -1;
    }
  })();

  const defaultClause = {
    documentTypeKey
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
      switch (clause?.['contractType'] ?? ContractType.GS) {
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
            c.USR$DATEEND DATEEND,
            con.NAME as CUSTOMER_NAME,
            con.ID as CUSTOMER_ID
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

    await forEachAsync(contracts, async (c) => {
      c.customer = {
        ID: c['CUSTOMER_ID'],
        NAME: c['CUSTOMER_NAME']
      };
      delete c['CUSTOMER_NAME'];
      delete c['CUSTOMER_ID'];
    });

    return contracts;
  } finally {
    releaseReadTransaction();
  }
};

const findOne: FindOneHandler = async (
  sessionID,
  clause = {}
) => {
  return new Promise((resolve) => resolve({}));
};

const update: UpdateHandler = async (
  sessionID,
  id,
  metadata
) => {
  return new Promise((resolve) => resolve({}));
};

const save: SaveHandler = async (
  sessionID,
  metadata
) => {
  return new Promise((resolve) => resolve({}));
};

const remove: RemoveHandler = async (
  sessionID,
  id
) => {
  return new Promise((resolve) => resolve(false));
};


export const contractsRepository = {
  find,
  findOne,
  update,
  save,
  remove
};
