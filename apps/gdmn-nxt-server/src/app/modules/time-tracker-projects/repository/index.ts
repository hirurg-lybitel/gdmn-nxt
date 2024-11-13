import { adjustRelationName } from '@gdmn-nxt/controllers/er/at-utils';
import { acquireReadTransaction } from '@gdmn-nxt/db-connection';
import { FindHandler, FindOneHandler, FindOperator, ITimeTrackProject } from '@gsbelarus/util-api-types';

const find: FindHandler<ITimeTrackProject> = async (
  sessionID,
  clause,
  order = { 'USR$NAME': 'ASC' }
) => {
  const {
    fetchAsObject,
    releaseReadTransaction,
  } = await acquireReadTransaction(sessionID);

  try {
    const whereClause = {};
    const clauseString = Object
      .keys({
        ...clause })
      .map(f => {
        if (typeof clause[f] === 'object' && 'operator' in clause[f]) {
          const expression = clause[f] as FindOperator;
          switch (expression.operator) {
            case 'LIKE':
              return ` UPPER(z.${f}) ${expression.value} `;
          }
        }

        whereClause[adjustRelationName(f)] = clause[f];
        return ` z.${f} = :${adjustRelationName(f)}`;
      })
      .join(' AND ');

    const rows = await fetchAsObject(
      `SELECT
        z.ID,
        z.USR$NAME NAME,
        z.USR$CUSTOMER CUSTOMER_ID,
        con.NAME CUSTOMER_NAME
      FROM USR$CRM_TIMETRACKER_PROJECTS z
      JOIN GD_CONTACT con ON con.ID = z.USR$CUSTOMER
      ${clauseString.length > 0 ? ` WHERE ${clauseString}` : ''}
      ${order ? ` ORDER BY z.${Object.keys(order)[0]} ${Object.values(order)[0]}` : ''}`,
      { ...whereClause });

    const projects: ITimeTrackProject[] = rows.map(r => ({
      ID: r['ID'],
      name: r['NAME'],
      customer: {
        ID: r['CUSTOMER_ID'],
        NAME: r['CUSTOMER_NAME']
      }
    }));

    return projects;
  } finally {
    releaseReadTransaction();
  }
};

const findOne: FindOneHandler<ITimeTrackProject> = async (
  sessionID,
  clause = {}
) => {
  const rows = await find(sessionID, clause);

  if (rows.length === 0) {
    return Promise.resolve(undefined);
  }

  return rows[0];
};

export const timeTrackerProjectsRepository = {
  find,
  findOne
};
