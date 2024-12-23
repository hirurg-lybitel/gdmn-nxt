import { adjustRelationName } from '@gdmn-nxt/controllers/er/at-utils';
import { acquireReadTransaction, startTransaction } from '@gdmn-nxt/db-connection';
import { IFavoriteTask } from '@gsbelarus/util-api-types';

const find = async (
  sessionID: string,
  clause = {}
): Promise<IFavoriteTask[]> => {
  const { fetchAsObject, releaseReadTransaction } = await acquireReadTransaction(sessionID);

  try {
    const whereClause = {};
    const clauseString = Object
      .keys({ ...clause })
      .map(f => {
        whereClause[adjustRelationName(f)] = clause[f];
        return ` f.${f} = :${adjustRelationName(f)}`;
      })
      .join(' AND ');

    const sql = `
      SELECT
        f.USR$USER USER_ID,
        f.USR$TASK AS TASK_ID,
        task.USR$NAME AS TASK_NAME
      FROM USR$CRM_TIMETRACKER_TASKS task
      JOIN USR$CRM_TIMET_TASKS_FAVORITE f ON task.ID = f.USR$TASK
      ${clauseString.length > 0 ? `WHERE ${clauseString}` : ''}`;

    const results = await fetchAsObject<IFavoriteTask>(sql, { ...whereClause });

    results?.forEach(f => {
      f.task = {
        ID: f['TASK_ID'],
        NAME: f['TASK_NAME']
      };
      f.user = f['USER_ID'];
      delete f['USER_ID'];
      delete f['TASK_ID'];
      delete f['TASK_NAME'];
    });

    return results;
  } finally {
    releaseReadTransaction();
  }
};

const save = async (
  sessionID: string,
  userId: number,
  taskId: number
): Promise<IFavoriteTask> => {
  const { fetchAsSingletonObject, releaseTransaction } = await startTransaction(sessionID);

  try {
    const result = await fetchAsSingletonObject<IFavoriteTask>(
      `UPDATE OR INSERT INTO USR$CRM_TIMET_TASKS_FAVORITE(USR$USER, USR$TASK)
      VALUES(:USER_ID, :TASK_ID)
      MATCHING(USR$USER, USR$TASK)
      RETURNING ID, USR$USER, USR$TASK`,
      {
        USER_ID: userId,
        TASK_ID: taskId,
      }
    );

    await releaseTransaction();

    return result;
  } catch (error) {
    await releaseTransaction(false);
    throw new Error(error);
  }
};

const remove = async (
  sessionID: string,
  userId: number,
  taskId: number
): Promise<{ID: number}> => {
  const { fetchAsSingletonObject, releaseTransaction } = await startTransaction(sessionID);

  try {
    const deletedRecord = await fetchAsSingletonObject<{ID: number}>(
      `DELETE FROM USR$CRM_TIMET_TASKS_FAVORITE
      WHERE USR$USER = :USER_ID AND USR$TASK = :TASK_ID
      RETURNING ID`,
      {
        USER_ID: userId,
        TASK_ID: taskId
      }
    );

    await releaseTransaction();

    return deletedRecord;
  } catch (error) {
    await releaseTransaction(false);
    throw new Error(error);
  }
};

export const favoriteTimeTrackerTasksRepository = {
  find,
  save,
  remove
};
