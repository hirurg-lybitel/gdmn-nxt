import { adjustRelationName } from '@gdmn-nxt/controllers/er/at-utils';
import { acquireReadTransaction, startTransaction } from '@gdmn-nxt/db-connection';
import { IFavoriteProject } from '@gsbelarus/util-api-types';

const find = async (
  sessionID: string,
  clause = {}
): Promise<IFavoriteProject[]> => {
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
        f.USR$PROJECT AS PROJECT_ID,
        project.USR$NAME AS PROJECT_NAME
      FROM USR$CRM_TIMETRACKER_PROJECTS project
      JOIN USR$CRM_TIMET_PROJECTS_FAVORITE f ON project.ID = f.USR$PROJECT
      ${clauseString.length > 0 ? `WHERE ${clauseString}` : ''}`;

    const results = await fetchAsObject<IFavoriteProject>(sql, { ...whereClause });

    results?.forEach(f => {
      f.project = {
        ID: f['PROJECT_ID'],
        NAME: f['PROJECT_NAME']
      };
      f.user = f['USER_ID'];
      delete f['USER_ID'];
      delete f['PROJECT_ID'];
      delete f['PROJECT_NAME'];
    });

    return results;
  } finally {
    releaseReadTransaction();
  }
};

const save = async (
  sessionID: string,
  userId: number,
  projectId: number
): Promise<IFavoriteProject> => {
  const { fetchAsSingletonObject, releaseTransaction } = await startTransaction(sessionID);

  try {
    const result = await fetchAsSingletonObject<IFavoriteProject>(
      `UPDATE OR INSERT INTO USR$CRM_TIMET_PROJECTS_FAVORITE(USR$USER, USR$PROJECT)
      VALUES(:USER_ID, :PROJECT_ID)
      MATCHING(USR$USER, USR$PROJECT)
      RETURNING ID, USR$USER, USR$PROJECT`,
      {
        USER_ID: userId,
        PROJECT_ID: projectId,
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
  projectId: number
): Promise<{ID: number}> => {
  const { fetchAsSingletonObject, releaseTransaction } = await startTransaction(sessionID);

  try {
    const deletedRecord = await fetchAsSingletonObject<{ID: number}>(
      `DELETE FROM USR$CRM_TIMET_PROJECTS_FAVORITE
      WHERE USR$USER = :USER_ID AND USR$PROJECT = :PROJECT_ID
      RETURNING ID`,
      {
        USER_ID: userId,
        PROJECT_ID: projectId
      }
    );

    await releaseTransaction();

    return deletedRecord;
  } catch (error) {
    await releaseTransaction(false);
    throw new Error(error);
  }
};

export const favoriteTimeTrackerProjectsRepository = {
  find,
  save,
  remove,
};
