import { acquireReadTransaction, startTransaction } from '@gdmn-nxt/db-connection';
import { FindHandler, FindOneHandler, FindOperator, IFilter, ISegment, RemoveOneHandler, SaveHandler, UpdateHandler, UserType } from '@gsbelarus/util-api-types';
import { forEachAsync } from '@gsbelarus/util-helpers';

const getTableName = (type: UserType) => {
  return type === UserType.Tickets ? 'USR$CRM_T_USER_FILTERS' : 'USR$CRM_FILTERS';
};

const find: FindHandler<IFilter> = async (
  sessionID,
  clause = {},
  _,
  type
) => {
  const { fetchAsObject, releaseReadTransaction, blob2String } = await acquireReadTransaction(sessionID);

  try {
    const params = [];
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
        params.push(clause[f]);
        return ` f.${f} = ?`;
      })
      .join(' AND ');

    const tableName = getTableName(type);

    const sql = `
      SELECT
        ID,
        USR$ENTITYNAME,
        USR$FILTERS
      FROM ${tableName} f
      ${clauseString.length > 0 ? ` WHERE ${clauseString}` : ''}`;

    const filters = await fetchAsObject<any>(sql, params);

    await forEachAsync<IFilter>(filters, async f => {
      const filter = await blob2String(f['USR$FILTERS']);
      f.filters = filter ? JSON.parse(filter) : {};
      f.entityName = f['USR$ENTITYNAME'];

      delete f['USR$ENTITYNAME'];
      delete f['USR$FILTERS'];
    });

    return filters;
  } finally {
    releaseReadTransaction();
  }
};

const findOne: FindOneHandler<ISegment> = async (sessionID, clause = {}, type) => {
  const filter = await find(sessionID, clause, undefined, type);

  if (filter.length === 0) {
    return Promise.resolve(undefined);
  }

  return filter[0];
};

const update: UpdateHandler<IFilter> = async (
  sessionID,
  id,
  metadata,
  type
) => {
  const { fetchAsSingletonObject, releaseTransaction, string2Blob } = await startTransaction(sessionID);

  const tableName = getTableName(type);

  try {
    const ID = id;

    const {
      filters,
      entityName
    } = metadata;

    const updatedFilter = await fetchAsSingletonObject<IFilter>(
      `UPDATE ${tableName}
      SET
        USR$ENTITYNAME = :ENTITYNAME,
        USR$FILTERS = :FILTERS
      WHERE
        ID = :ID
      RETURNING ID`,
      {
        ID,
        ENTITYNAME: entityName,
        FILTERS: await string2Blob(JSON.stringify(filters)),
      }
    );

    await releaseTransaction();

    return updatedFilter;
  } catch (error) {
    await releaseTransaction(false);
    throw new Error(error);
  }
};

interface IFilterSave extends IFilter {
  userId: number;
}

const save: SaveHandler<IFilterSave> = async (
  sessionID,
  metadata,
  type
) => {
  const { fetchAsSingletonObject, releaseTransaction, string2Blob } = await startTransaction(sessionID);

  const { entityName, filters, userId } = metadata;

  const tableName = getTableName(type);

  try {
    const filter = await fetchAsSingletonObject<IFilterSave>(
      `INSERT INTO ${tableName}(USR$ENTITYNAME,USR$FILTERS,USR$USERKEY)
      VALUES(:ENTITYNAME,:FILTERS,:USERKEY)
      RETURNING ID`,
      {
        ENTITYNAME: entityName,
        FILTERS: await string2Blob(JSON.stringify(filters)),
        USERKEY: userId
      }
    );

    await releaseTransaction();

    return filter;
  } catch (error) {
    await releaseTransaction(false);
    throw new Error(error);
  }
};

const remove: RemoveOneHandler = async (
  sessionID,
  id,
  type
) => {
  const { fetchAsSingletonObject, releaseTransaction } = await startTransaction(sessionID);

  const tableName = getTableName(type);

  try {
    const deletedFilter = await fetchAsSingletonObject<{ ID: number; }>(
      `DELETE FROM ${tableName} WHERE ID = :id
      RETURNING ID`,
      { id }
    );

    await releaseTransaction();

    return !!deletedFilter.ID;
  } catch (error) {
    await releaseTransaction(false);
    throw new Error(error);
  }
};

export const filtersRepository = {
  find,
  findOne,
  update,
  save,
  remove
};
