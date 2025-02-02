import { adjustRelationName } from '@gdmn-nxt/controllers/er/at-utils';
import { acquireReadTransaction, startTransaction } from '@gdmn-nxt/db-connection';
import { FindHandler, FindOneHandler, FindOperator, IDealFeedback, RemoveOneHandler, SaveHandler, UpdateHandler } from '@gsbelarus/util-api-types';
import dayjs from '@gdmn-nxt/dayjs';
import { forEachAsync } from '@gsbelarus/util-helpers';

const find: FindHandler<IDealFeedback> = async (
  sessionID,
  clause
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
              return ` UPPER(f.${f}) ${expression.value} `;
          }
        }

        whereClause[adjustRelationName(f)] = clause[f];
        return ` f.${f} = :${adjustRelationName(f)}`;
      })
      .join(' AND ');

    const rows = await fetchAsObject(
      `SELECT
        f.ID,
        f.USR$ONDATE,
        f.USR$DEAL,
        f.USR$ANSWER ,
        f.USR$SUGGESTION,
        f.USR$REPLYEMAIL,
        res.ID RES_ID, res.USR$NAME RES_NAME,
        comp.ID COMP_ID, comp.USR$NAME COMP_NAME,
        sat.ID SAT_ID, sat.USR$NAME SAT_NAME,
        rate.ID RATE_ID, rate.USR$NAME RATE_NAME
      FROM USR$CRM_DEAL_FEEDBACK f
      JOIN USR$CRM_DEALS deal ON deal.ID = f.USR$DEAL
      LEFT JOIN USR$CRM_FEEDBACK_RESULT res ON res.ID = f.USR$RESULT
      LEFT JOIN USR$CRM_FEEDBACK_COMPETENCE comp ON comp.ID = f.USR$COMPETENCE
      LEFT JOIN USR$CRM_FEEDBACK_SATISFACTION sat ON sat.ID = f.USR$SATISFACTION
      LEFT JOIN USR$CRM_FEEDBACK_RATING rate ON rate.ID = f.USR$SATISFACTION_RATING
      ${clauseString.length > 0 ? ` WHERE ${clauseString}` : ''}
      ORDER BY f.USR$ONDATE`,
      { ...whereClause });

    const feedback: IDealFeedback[] = [];
    await forEachAsync(rows, async r => {
      feedback.push({
        id: r['ID'],
        dealId: r['USR$DEAL'],
        date: r['USR$ONDATE'],
        response: await blob2String(r['USR$ANSWER']),
        suggestion: await blob2String(r['USR$SUGGESTION']),
        ...(r['RES_ID'] && { result: { id: r['RES_ID'], name: r['RES_NAME'] } }),
        ...(r['COMP_ID'] && { competence: { id: r['COMP_ID'], name: r['COMP_NAME'] } }),
        ...(r['SAT_ID'] && { satisfaction: { id: r['SAT_ID'], name: r['SAT_NAME'] } }),
        ...(r['RATE_ID'] && { satisfactionRate: { id: r['RATE_ID'], name: r['RATE_NAME'] } }),
        replyEmail: r['USR$REPLYEMAIL'] === 1
      });
    });

    return feedback;
  } finally {
    releaseReadTransaction();
  }
};

const findOne: FindOneHandler<IDealFeedback> = async (
  sessionID,
  clause = {}
) => {
  const rows = await find(sessionID, clause);

  if (rows.length === 0) {
    return Promise.resolve(undefined);
  }

  return rows[0];
};

const update: UpdateHandler<IDealFeedback> = async (
  sessionID,
  id,
  metadata
) => {
  const { fetchAsSingletonObject, releaseTransaction, string2Blob } = await startTransaction(sessionID);

  try {
    const feedback = await findOne(sessionID, { id });

    const {
      date = feedback.date,
      response = feedback.response,
      suggestion = feedback.suggestion,
      result = feedback.result,
      competence = feedback.competence,
      satisfaction = feedback.satisfaction,
      satisfactionRate = feedback.satisfactionRate,
      replyEmail
    } = metadata;

    const updatedFeedback = await fetchAsSingletonObject<IDealFeedback>(
      `UPDATE USR$CRM_DEAL_FEEDBACK
      SET
        USR$ONDATE = :onDate,
        USR$ANSWER = :response,
        USR$SUGGESTION = :suggestion,
        USR$RESULT = :result,
        USR$COMPETENCE = :competence,
        USR$SATISFACTION = :satisfaction,
        USR$SATISFACTION_RATING = :satisfactionRate,
        USR$REPLYEMAIL = :replyEmail
      WHERE
        ID = :id
      RETURNING ID`,
      {
        id,
        onDate: date ? dayjs(date).toDate() : dayjs().toDate(),
        response: await string2Blob(response),
        suggestion: await string2Blob(suggestion),
        result: result?.id ?? null,
        competence: competence?.id ?? null,
        satisfaction: satisfaction?.id ?? null,
        satisfactionRate: satisfactionRate?.id ?? null,
        replyEmail: replyEmail ?? false
      }
    );
    await releaseTransaction();

    return updatedFeedback;
  } catch (error) {
    await releaseTransaction(false);
    throw new Error(error);
  }
};

const save: SaveHandler<IDealFeedback> = async (
  sessionID,
  metadata
) => {
  const { fetchAsSingletonObject, releaseTransaction, string2Blob } = await startTransaction(sessionID);

  const {
    dealId,
    date,
    response,
    suggestion,
    result,
    competence,
    satisfaction,
    satisfactionRate,
    replyEmail
  } = metadata;

  try {
    const newFeedback = await fetchAsSingletonObject<IDealFeedback>(
      `INSERT INTO USR$CRM_DEAL_FEEDBACK(USR$ONDATE, USR$ANSWER, USR$SUGGESTION, USR$RESULT, USR$COMPETENCE, USR$SATISFACTION, USR$SATISFACTION_RATING, USR$DEAL, USR$REPLYEMAIL)
      VALUES(:date, :response, :suggestion, :result, :competence, :satisfaction, :satisfactionRate, :dealId, :replyEmail)
      RETURNING ID`,
      {
        date: date ? dayjs(date).toDate() : dayjs().toDate(),
        response: await string2Blob(response),
        suggestion: await string2Blob(suggestion),
        result: result?.id ?? null,
        competence: competence?.id ?? null,
        satisfaction: satisfaction?.id ?? null,
        satisfactionRate: satisfactionRate?.id ?? null,
        dealId,
        replyEmail
      }
    );

    const feedback = await findOne(sessionID, { id: newFeedback.id });

    await releaseTransaction();

    return feedback;
  } catch (error) {
    await releaseTransaction(false);
    throw new Error(error);
  }
};

const remove: RemoveOneHandler = async (
  sessionID,
  id
) => {
  const { fetchAsSingletonObject, releaseTransaction } = await startTransaction(sessionID);

  try {
    const deletedEntity = await fetchAsSingletonObject<{ID: number}>(
      `DELETE FROM USR$CRM_DEAL_FEEDBACK WHERE ID = :id
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

export const dealFeedbackRepository = {
  find,
  findOne,
  update,
  save,
  remove
};
