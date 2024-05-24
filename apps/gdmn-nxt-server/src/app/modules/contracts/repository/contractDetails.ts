import { acquireReadTransaction } from '@gdmn-nxt/db-connection';
import { ContractType, FindHandler, IContractDetail } from '@gsbelarus/util-api-types';

const find: FindHandler<IContractDetail> = async (sessionID, clause = {}) => {
  const { fetchAsObject, releaseReadTransaction } = await acquireReadTransaction(sessionID);

  const clauseString = Object
    .keys({ ...clause })
    .filter(f => f.toLowerCase() !== 'contracttype')
    .map(f => ` ${f === 'documentTypeKey' ? 'doc' : 'cl'}.${f} = :${f.toString().replace('usr$', '')}`)
    .join(' AND ');

  const preparedClause = {
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
          return `SELECT
            cl.DOCUMENTKEY ID,
            cl.MASTERKEY CONTRACTID,
            good.NAME,
            cl.USR$QUANTITY QUANTITY,
            cl.USR$COST PRICE,
            cl.USR$SUMNCU AMOUNT
          FROM USR$BNF_CONTRACTLINE cl
            JOIN GD_GOOD good ON good.ID = cl.USR$BENEFITSNAME
            ${clauseString.length > 0 ? `WHERE ${clauseString}` : ''}
          ORDER BY
            cl.MASTERKEY, good.NAME`;
        case ContractType.BG:
          return `
            SELECT
              cl.DOCUMENTKEY ID,
              cl.MASTERKEY CONTRACTID,
              good.USR$NAME  ||  ' '  || stname.USR$NAME as NAME,
              0 QUANTITY,
              cl.USR$SUMNCU PRICE,
              cl.USR$SUMNCU AMOUNT
            FROM USR$BG_CONTRACTLINE cl
              left JOIN USR$BG_CONTRACT_STAGE good ON good.ID = cl.USR$STAGE
              left JOIN USR$BG_CONTRACT_STAGE_NAME stname ON stname.ID = cl.USR$STAGENAME
              ${clauseString.length > 0 ? `WHERE ${clauseString}` : ''}
            ORDER BY
            cl.MAST ERKEY, good.USR$NAME`;
      }
    })();

    const contracts = await fetchAsObject<IContractDetail>(sql, preparedClause);

    return contracts;
  } finally {
    releaseReadTransaction();
  }
};

export const contractDetailRepository = {
  find
};
