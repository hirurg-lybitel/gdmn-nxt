import { adjustRelationName } from '@gdmn-nxt/controllers/er/at-utils';
import { acquireReadTransaction, startTransaction } from '@gdmn-nxt/db-connection';
import { IFavoriteWorkProject } from '@gsbelarus/util-api-types';

const find = async (
  sessionID: string,
  clause = {}
): Promise<IFavoriteWorkProject[]> => {
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
        f.USR$TIMETRACK_TYPE AS WORK_ID,
        work.USR$NAME AS WORK_NAME
      FROM USR$CRM_TIMETRACKER_TYPES work
      JOIN USR$CRM_TIMETRACK_FAVORITE f ON work.ID = f.USR$TIMETRACK_TYPE
      ${clauseString.length > 0 ? `WHERE ${clauseString}` : ''}`;

    const results = await fetchAsObject<IFavoriteWorkProject>(sql, { ...whereClause });

    results?.forEach(f => {
      f.workProject = {
        ID: f['WORK_ID'],
        NAME: f['WORK_NAME']
      };
      f.user = f['USER_ID'];
      delete f['USER_ID'];
      delete f['WORK_ID'];
      delete f['WORK_NAME'];
    });

    return results;
  } finally {
    releaseReadTransaction();
  }
};

const save = async (
  sessionID: string,
  userId: number,
  workProjectId: number
): Promise<IFavoriteWorkProject> => {
  const { fetchAsSingletonObject, releaseTransaction } = await startTransaction(sessionID);

  try {
    const result = await fetchAsSingletonObject<IFavoriteWorkProject>(
      `UPDATE OR INSERT INTO USR$CRM_TIMETRACK_FAVORITE(USR$USER, USR$TIMETRACK_TYPE)
      VALUES(:USER_ID, :WORK_ID)
      MATCHING(USR$USER, USR$TIMETRACK_TYPE)
      RETURNING ID, USR$USER, USR$TIMETRACK_TYPE`,
      {
        USER_ID: userId,
        WORK_ID: workProjectId,
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
  workProjectId: number
): Promise<{ID: number}> => {
  const { fetchAsSingletonObject, releaseTransaction } = await startTransaction(sessionID);

  try {
    const deletedRecord = await fetchAsSingletonObject<{ID: number}>(
      `DELETE FROM USR$CRM_TIMETRACK_FAVORITE
      WHERE USR$USER = :USER_ID AND USR$TIMETRACK_TYPE = :WORK_ID
      RETURNING ID`,
      {
        USER_ID: userId,
        WORK_ID: workProjectId
      }
    );

    await releaseTransaction();

    return deletedRecord;
  } catch (error) {
    await releaseTransaction(false);
    throw new Error(error);
  }
};

export const favoriteWorkProjectRepository = {
  find,
  save,
  remove
};
