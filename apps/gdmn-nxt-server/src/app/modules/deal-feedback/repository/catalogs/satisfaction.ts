import { adjustRelationName } from '@gdmn-nxt/controllers/er/at-utils';
import { acquireReadTransaction } from '@gdmn-nxt/db-connection';
import { FindHandler, FindOperator, IDealFeedbackSatisfaction } from '@gsbelarus/util-api-types';

const find: FindHandler<IDealFeedbackSatisfaction> = async (
  sessionID,
  clause
) => {
  const { fetchAsObject, releaseReadTransaction } = await acquireReadTransaction(sessionID);

  try {
    const whereClause = {};
    const clauseString = Object
      .keys({ ...clause })
      .map(f => {
        if (typeof clause[f] === 'object' && 'operator' in clause[f]) {
          const expression = clause[f] as FindOperator;
          switch (expression.operator) {
            case 'LIKE':
              return ` UPPER(z.${f}) ${expression.value} `;
          }
        }

        whereClause[adjustRelationName(f)] = clause[f];
        return ` f.${f} = :${adjustRelationName(f)}`;
      })
      .join(' AND ');

    const rows = await fetchAsObject(
      `SELECT
        z.ID,
        z.USR$NAME
      FROM USR$CRM_FEEDBACK_SATISFACTION z
      ${clauseString.length > 0 ? ` WHERE ${clauseString}` : ''}
      ORDER BY z.USR$NUMBER`,
      { ...whereClause });

    const entities = rows.map<IDealFeedbackSatisfaction>(r => ({
      id: r['ID'],
      name: r['USR$NAME'],
    }));

    return entities;
  } finally {
    releaseReadTransaction();
  }
};

export const satisfactionFeedbackRepository = {
  find,
};
