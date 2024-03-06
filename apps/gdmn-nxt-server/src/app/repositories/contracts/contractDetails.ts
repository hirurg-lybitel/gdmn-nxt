import { acquireReadTransaction } from '@gdmn-nxt/db-connection';
import { FindHandler, IContractDetail } from '@gsbelarus/util-api-types';

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
    const sql = `
      SELECT
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

    const contracts = await fetchAsObject<IContractDetail>(sql, preparedClause);

    return contracts;
  } finally {
    releaseReadTransaction();
  }
};

export const contractDetailRepository = {
  find
};
