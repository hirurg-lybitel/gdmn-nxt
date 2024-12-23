import { adjustRelationName } from '@gdmn-nxt/controllers/er/at-utils';
import { acquireReadTransaction, startTransaction } from '@gdmn-nxt/db-connection';
import { FindHandler, FindOneHandler, FindOperator, ICustomerFeedback, RemoveHandler, SaveHandler, UpdateHandler } from '@gsbelarus/util-api-types';

const find: FindHandler<ICustomerFeedback> = async (
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
              return ` UPPER(f.${f}) ${expression.value} `;
          }
        }

        whereClause[adjustRelationName(f)] = clause[f];
        return ` f.${f} = :${adjustRelationName(f)}`;
      })
      .join(' AND ');

    const rows = await fetchAsObject(
      `SELECT
        f.ID, USR$RESPONSE, USR$TODO,
        con.ID CON_ID, con.NAME CON_NAME,
        m.ID MAILING_ID, M.USR$NAME MAILING_NAME,
        f.USR$FEEDBACKTYPE FEEDBACKTYPE,
        f.USR$CREATIONDATE CREATIONDATE,
        u.ID USER_ID, u.NAME USER_NAME,
        ucon.ID AS UCON_ID,
        ucon.NAME AS UCON_NAME
      FROM USR$CRM_CUSTOMERS_FEEDBACK f
      JOIN GD_CONTACT con ON con.ID = f.USR$CUSTOMERKEY
      LEFT JOIN USR$CRM_MARKETING_MAILING m ON m.ID = f.USR$MAILINGKEY
      LEFT JOIN GD_USER u ON u.ID = f.USR$CREATOR
      LEFT JOIN GD_CONTACT ucon ON ucon.ID = u.CONTACTKEY
      ${clauseString.length > 0 ? ` WHERE ${clauseString}` : ''}
      ORDER BY f.USR$CREATIONDATE DESC`,
      { ...whereClause });

    const feedback: ICustomerFeedback[] = rows.map<ICustomerFeedback>(r => ({
      ID: r['ID'],
      response: r['USR$RESPONSE'],
      toDo: r['USR$TODO'],
      type: r['FEEDBACKTYPE'],
      creationDate: r['CREATIONDATE'],
      ...(r['USER_ID'] && {
        creator: {
          ID: r['USER_ID'],
          NAME: r['USER_NAME'],
          CONTACT: {
            ID: r['UCON_ID'],
            NAME: r['UCON_NAME'],
          }
        },
      }),
      ...(r['CON_ID'] && { customer: { ID: r['CON_ID'], NAME: r['CON_NAME'] } }),
      ...(r['MAILING_ID'] && { mailing: { ID: r['MAILING_ID'], NAME: r['MAILING_NAME'] } })
    }));

    return feedback;
  } finally {
    releaseReadTransaction();
  }
};

const findOne: FindOneHandler<ICustomerFeedback> = async (
  sessionID,
  clause = {}
) => {
  const rows = await find(sessionID, clause);

  if (rows.length === 0) {
    return Promise.resolve(undefined);
  }

  return rows[0];
};

const update: UpdateHandler<ICustomerFeedback> = async (
  sessionID,
  id,
  metadata
) => {
  const { fetchAsSingletonObject, releaseTransaction } = await startTransaction(sessionID);

  try {
    const feedback = await findOne(sessionID, { id });

    const {
      response = feedback.response,
      toDo = feedback.toDo,
      customer = feedback.customer,
      mailing = feedback.mailing
    } = metadata;

    const updatedFeedback = await fetchAsSingletonObject<ICustomerFeedback>(
      `UPDATE USR$CRM_CUSTOMERS_FEEDBACK
      SET
        USR$TODO = :toDo,
        USR$RESPONSE = :response,
        USR$MAILINGKEY = :mailingKey,
        USR$CUSTOMERKEY = :customerKey
      WHERE
        ID = :id
      RETURNING ID`,
      {
        id,
        response,
        toDo,
        customerKey: customer.ID ?? null,
        mailingKey: mailing?.ID ?? null
      }
    );
    await releaseTransaction();

    return updatedFeedback;
  } catch (error) {
    await releaseTransaction(false);
    throw new Error(error);
  }
};

const save: SaveHandler<ICustomerFeedback> = async (
  sessionID,
  metadata
) => {
  const { fetchAsSingletonObject, releaseTransaction } = await startTransaction(sessionID);

  const {
    customer,
    mailing,
    response,
    toDo,
    type,
    creator
  } = metadata;

  try {
    const newFeedback = await fetchAsSingletonObject<ICustomerFeedback>(
      `INSERT INTO USR$CRM_CUSTOMERS_FEEDBACK(USR$TODO, USR$RESPONSE, USR$MAILINGKEY, USR$CUSTOMERKEY, USR$FEEDBACKTYPE, USR$CREATOR)
      VALUES(:toDo, :response, :mailingKey, :customerKey, :feedbackType, :creatorKey)
      RETURNING ID`,
      {
        toDo,
        response,
        mailingKey: mailing?.ID ?? null,
        customerKey: customer?.ID ?? null,
        feedbackType: type,
        creatorKey: creator?.ID ?? null
      }
    );

    const feedback = await findOne(sessionID, { ID: newFeedback.ID });

    await releaseTransaction();

    return feedback;
  } catch (error) {
    await releaseTransaction(false);
    throw new Error(error);
  }
};

const remove: RemoveHandler = async (
  sessionID,
  id
) => {
  const { fetchAsSingletonObject, releaseTransaction } = await startTransaction(sessionID);

  try {
    const deletedEntity = await fetchAsSingletonObject<{ID: number}>(
      `DELETE FROM USR$CRM_CUSTOMERS_FEEDBACK WHERE ID = :id
      RETURNING ID`,
      { id }
    );

    await releaseTransaction();

    return !!deletedEntity.ID;
  } catch (error) {
    await releaseTransaction(false);
    throw new Error(error);
  }
};

export const feedbackRepository = {
  find,
  findOne,
  update,
  save,
  remove
};
