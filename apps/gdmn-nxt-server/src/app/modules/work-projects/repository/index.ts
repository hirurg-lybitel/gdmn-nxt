import { adjustRelationName } from '@gdmn-nxt/controllers/er/at-utils';
import { acquireReadTransaction, startTransaction } from '@gdmn-nxt/db-connection';
import { FindHandler, FindOneHandler, FindOperator, IWorkProject, RemoveHandler, SaveHandler, UpdateHandler } from '@gsbelarus/util-api-types';

const find: FindHandler<IWorkProject> = async (
  sessionID,
  clause
) => {
  const { fetchAsObject, releaseReadTransaction } = await acquireReadTransaction(sessionID);

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

    const rows = await fetchAsObject<IWorkProject>(
      `SELECT
        ID,
        USR$NAME NAME,
        USR$STATUS STATUS
      FROM USR$CRM_TIMETRACKER_TYPES z
      ${clauseString.length > 0 ? ` WHERE ${clauseString}` : ''}
      ORDER BY z.USR$NAME`,
      { ...whereClause });

    return rows;
  } finally {
    releaseReadTransaction();
  }
};

const findOne: FindOneHandler<IWorkProject> = async (
  sessionID,
  clause = {}
) => {
  const rows = await find(sessionID, clause);

  if (rows.length === 0) {
    return Promise.resolve(undefined);
  }

  return rows[0];
};

const update: UpdateHandler<IWorkProject> = async (
  sessionID,
  id,
  metadata
) => {
  const {
    fetchAsSingletonObject,
    releaseTransaction
  } = await startTransaction(sessionID);

  try {
    const workProject = await findOne(sessionID, { id });

    const {
      NAME = workProject.NAME,
      STATUS = workProject.STATUS
    } = metadata;

    const updatedWorkProject = await fetchAsSingletonObject<IWorkProject>(
      `UPDATE USR$CRM_TIMETRACKER_TYPES
      SET
        USR$NAME = :NAME,
        USR$STATUS = :STATUS
      WHERE
        ID = :id
      RETURNING ID`,
      {
        id,
        NAME,
        STATUS
      }
    );
    await releaseTransaction();

    return updatedWorkProject;
  } catch (error) {
    await releaseTransaction(false);
    throw new Error(error);
  }
};

const save: SaveHandler<IWorkProject> = async (
  sessionID,
  metadata
) => {
  const {
    fetchAsSingletonObject,
    releaseTransaction
  } = await startTransaction(sessionID);

  const {
    NAME,
    STATUS
  } = metadata;

  try {
    const newWorkProject = await fetchAsSingletonObject<IWorkProject>(
      `INSERT INTO USR$CRM_TIMETRACKER_TYPES(USR$NAME, USR$STATUS)
      VALUES(:NAME, :STATUS)
      RETURNING ID`,
      {
        NAME,
        STATUS
      }
    );

    const workProject = await findOne(sessionID, { ID: newWorkProject.ID });

    await releaseTransaction();

    return workProject;
  } catch (error) {
    await releaseTransaction(false);
    throw new Error(error);
  }
};

const remove: RemoveHandler = async (
  sessionID,
  id
) => {
  const {
    fetchAsSingletonObject,
    releaseTransaction
  } = await startTransaction(sessionID);

  try {
    const deletedEntity = await fetchAsSingletonObject<{ID: number}>(
      `DELETE FROM USR$CRM_TIMETRACKER_TYPES WHERE ID = :id
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

export const workProjectsRepository = {
  find,
  findOne,
  update,
  save,
  remove
};
