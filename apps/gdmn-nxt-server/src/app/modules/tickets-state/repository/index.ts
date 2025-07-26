import { acquireReadTransaction } from '@gdmn-nxt/db-connection';
import { FindHandler, FindOneHandler, FindOperator, ITicketState } from '@gsbelarus/util-api-types';

const find: FindHandler<ITicketState> = async (
  sessionID,
  clause = {}
) => {
  const { fetchAsObject, releaseReadTransaction } = await acquireReadTransaction(sessionID);

  try {
    const params = [];
    const clauseString = Object
      .keys({ ...clause })
      .map(f => {
        if (typeof clause[f] === 'object' && 'operator' in clause[f]) {
          const expression = clause[f] as FindOperator;
          switch (expression.operator) {
            case 'LIKE':
              return ` UPPER(f.${f}) ${expression.value} `;
            case 'IsNull':
              return `${f} IS NULL`;
            case 'IsNotNull':
              return `${f} IS NOT NULL`;
          }
        }
        params.push(clause[f]);
        return `t.${f} = ?`;
      })
      .join(' AND ');

    const sql = `
      SELECT
        ts.ID,
        ts.USR$NAME,
        ts.USR$CODE,
        ts.USR$SORT
      FROM USR$CRM_TICKET_STATE ts
      ORDER BY USR$SORT ASC
      ${clauseString.length > 0 ? ` WHERE ${clauseString}` : ''}`;

    const result = await fetchAsObject<any>(sql, params);

    const tikcetStates: ITicketState[] = await Promise.all(result.map(async (data) => {
      return {
        ID: data['ID'],
        name: data['USR$NAME'],
        code: data['USR$CODE']
      };
    }));

    return tikcetStates;
  } finally {
    releaseReadTransaction();
  }
};

const findOne: FindOneHandler<ITicketState> = async (sessionID, clause = {}) => {
  const ticketState = await find(sessionID, clause, undefined);

  if (ticketState.length === 0) {
    return Promise.resolve(undefined);
  }

  return ticketState[0];
};

export const ticketsStateRepository = {
  find,
  findOne
};
