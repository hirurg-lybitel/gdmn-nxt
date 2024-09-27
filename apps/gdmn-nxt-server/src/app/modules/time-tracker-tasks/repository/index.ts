import { adjustRelationName } from '@gdmn-nxt/controllers/er/at-utils';
import { acquireReadTransaction } from '@gdmn-nxt/db-connection';
import { FindHandler, FindOneHandler, FindOperator, ITimeTrackTask } from '@gsbelarus/util-api-types';

const find: FindHandler<ITimeTrackTask> = async (
  sessionID,
  clause
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
        z.USR$PROJECT PROJECT_ID,
        p.USR$NAME PROJECT_NAME,
        con.ID CONTACT_ID,
        con.NAME CONTACT_NAME
      FROM USR$CRM_TIMETRACKER_TASKS z
      JOIN USR$CRM_TIMETRACKER_PROJECTS p ON p.ID = z.USR$PROJECT
      JOIN GD_CONTACT con ON con.ID = p.USR$CUSTOMER
      ${clauseString.length > 0 ? ` WHERE ${clauseString}` : ''}
      ORDER BY z.USR$NAME`,
      { ...whereClause });

    const tasks: ITimeTrackTask[] = rows.map(r => ({
      ID: r['ID'],
      name: r['NAME'],
      project: {
        ID: r['PROJECT_ID'],
        name: r['PROJECT_NAME'],
        customer: {
          ID: r['CONTACT_ID'],
          NAME: r['CONTACT_NAME'],
        }
      }
    }));

    return tasks;
  } finally {
    releaseReadTransaction();
  }
};

const findOne: FindOneHandler<ITimeTrackTask> = async (
  sessionID,
  clause = {}
) => {
  const rows = await find(sessionID, clause);

  if (rows.length === 0) {
    return Promise.resolve(undefined);
  }

  return rows[0];
};

export const timeTrackerTasksRepository = {
  find,
  findOne
};
