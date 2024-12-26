import { adjustRelationName } from '@gdmn-nxt/controllers/er/at-utils';
import { acquireReadTransaction, startTransaction } from '@gdmn-nxt/db-connection';
import { FindHandler, FindOneHandler, FindOperator, IProjectType, ITimeTrack, RemoveHandler, SaveHandler, UpdateHandler } from '@gsbelarus/util-api-types';

const find: FindHandler<IProjectType> = async (
  sessionID,
  clause
) => {
  const {
    fetchAsObject,
    releaseReadTransaction
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
            case 'IN':
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
        z.USR$PARENT,
        z.USR$NAME
      FROM USR$CRM_TT_PROJECT_TYPE z
      ${clauseString.length > 0 ? ` WHERE ${clauseString}` : ''}`,
      { ...whereClause });

    const projectTypes: IProjectType[] = await Promise.all(rows.map(async r => ({
      ID: r['ID'],
      name: r['USR$NAME'],
      parent: r['USR$PARENT']
    })));

    return projectTypes;
  } finally {
    releaseReadTransaction();
  }
};

const findOne: FindOneHandler<IProjectType> = async (
  sessionID,
  clause = {}
) => {
  const rows = await find(sessionID, clause);

  if (rows.length === 0) {
    return Promise.resolve(undefined);
  }

  return rows[0];
};

const update: UpdateHandler<IProjectType> = async (
  sessionID,
  id,
  metadata
) => {
  const {
    fetchAsSingletonObject,
    releaseTransaction
  } = await startTransaction(sessionID);

  try {
    const projectType = await findOne(sessionID, { id });

    const {
      name = projectType.name,
      parent = projectType.parent,
    } = metadata;

    const updatedProjectType = await fetchAsSingletonObject<IProjectType>(
      `UPDATE USR$CRM_TT_PROJECT_TYPE z
      SET
        z.USR$NAME = :name,
        z.USR$PARENT = :parent
      WHERE
        ID = :id
      RETURNING ID`,
      {
        id,
        name,
        parent
      }
    );
    await releaseTransaction();

    return updatedProjectType;
  } catch (error) {
    await releaseTransaction(false);
    throw new Error(error);
  }
};

const save: SaveHandler<IProjectType> = async (
  sessionID,
  metadata
) => {
  const {
    fetchAsSingletonObject,
    releaseTransaction
  } = await startTransaction(sessionID);

  const {
    name,
    parent
  } = metadata;

  try {
    const newProjectType = await fetchAsSingletonObject<ITimeTrack>(
      `INSERT INTO USR$CRM_TT_PROJECT_TYPE(USR$NAME, USR$PARENT)
      VALUES(:name, :parent)
      RETURNING ID`,
      {
        name,
        parent,
      }
    );

    await releaseTransaction();
    const projetType = await findOne(sessionID, { ID: newProjectType.ID });

    return projetType;
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
      `DELETE FROM USR$CRM_TT_PROJECT_TYPE WHERE ID = :id
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

export const timeTrackingProjectTypesRepository = {
  find,
  findOne,
  update,
  save,
  remove
};
