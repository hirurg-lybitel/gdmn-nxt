import { adjustRelationName } from '@gdmn-nxt/controllers/er/at-utils';
import { acquireReadTransaction, startTransaction } from '@gdmn-nxt/db-connection';
import { FindHandler, FindOneHandler, FindOperator, IMailingHistory, RemoveHandler, SaveHandler } from '@gsbelarus/util-api-types';
import { forEachAsync, prepareClause } from '@gsbelarus/util-helpers';
import dayjs from '@gdmn-nxt/dayjs';

const find: FindHandler<IMailingHistory> = async (
  sessionID,
  clause = {}
) => {
  const { fetchAsObject, releaseReadTransaction, blob2String } = await acquireReadTransaction(sessionID);

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
        return ` z.${f} = :${adjustRelationName(f)}`;
      })
      .join(' AND ');

    const rows = await fetchAsObject(
      `SELECT
        z.ID,
        z.USR$ONDATE,
        z.USR$DESCRIPTION,
        z.USR$STATUS,
        z.USR$MAILING,
        con.ID CON_ID,
        con.NAME CON_NAME,
        con.EMAIL CON_EMAIL
      FROM USR$CRM_MARKETING_MAILING_RES z
      JOIN USR$CRM_MARKETING_MAILING mail ON mail.ID = z.USR$MAILING
      LEFT JOIN GD_CONTACT con ON con.ID = z.USR$CONTACT
      ${clauseString.length > 0 ? ` WHERE ${clauseString}` : ''}
      ORDER BY z.USR$ONDATE DESC, con.NAME`,
      whereClause
    );

    const entities: IMailingHistory[] = [];

    await forEachAsync(rows, async row => {
      entities.push({
        id: row['ID'],
        date: dayjs(row['USR$ONDATE']).toISOString(),
        description: await blob2String(row['USR$DESCRIPTION']),
        status: row['USR$STATUS'],
        mailingId: row['USR$MAILING'],
        customer: {
          ID: row['CON_ID'],
          NAME: row['CON_NAME'],
          EMAIL: row['CON_EMAIL']
        }
      });
    });

    return entities;
  } finally {
    await releaseReadTransaction();
  }
};

const findOne: FindOneHandler<IMailingHistory> = async (
  sessionID,
  clause = {}
) => {
  const rows = await find(sessionID, clause);

  if (rows.length === 0) {
    return Promise.resolve(undefined);
  }

  return rows[0];
};

const save: SaveHandler<IMailingHistory> = async (
  sessionID,
  metadata) => {
  const { fetchAsSingletonObject, releaseTransaction, string2Blob } = await startTransaction(sessionID);

  const {
    date,
    description,
    status,
    customer,
    mailingId
  } = metadata;

  try {
    const row = await fetchAsSingletonObject(
      `INSERT INTO USR$CRM_MARKETING_MAILING_RES(
          USR$ONDATE, USR$DESCRIPTION, USR$STATUS, USR$MAILING, USR$CONTACT)
        VALUES(:date, :description, :status, :mailingId, :customerId)
        RETURNING ID`,
      {
        date: dayjs(date).toDate(),
        description: await string2Blob(description),
        status,
        mailingId,
        customerId: customer.ID
      }
    );

    await releaseTransaction();

    return await findOne(sessionID, { id: row.ID });
  } catch (error) {
    console.error('[ save ]', error);
    await releaseTransaction(false);
    throw new Error(error);
  }
};

const removeAll: RemoveHandler = async (
  sessionID,
  clause
) => {
  const { execute, releaseTransaction } = await startTransaction(sessionID);

  try {
    const prefix = 'z';
    const { clauseString, whereClause } = prepareClause(clause, { prefix: () => prefix });

    await execute(
      `DELETE FROM USR$CRM_MARKETING_MAILING_RES ${prefix}
      ${clauseString.length > 0 ? ` WHERE ${clauseString}` : ''}`,
      whereClause
    );

    await releaseTransaction();

    return true;
  } catch (error) {
    await releaseTransaction(false);
    throw new Error(error);
  }
};

export const mailingHistoryRepository = {
  find,
  findOne,
  save,
  removeAll
};
