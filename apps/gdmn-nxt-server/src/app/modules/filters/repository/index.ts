import { adjustRelationName } from '@gdmn-nxt/controllers/er/at-utils';
import { acquireReadTransaction, startTransaction } from '@gdmn-nxt/db-connection';
import { customersRepository } from '@gdmn-nxt/repositories/customers';
import { ArrayElement, FindHandler, FindOneHandler, FindOperator, IFilter, ISegment, ISegmnentField, RemoveHandler, SaveHandler, UpdateHandler } from '@gsbelarus/util-api-types';
import { forEachAsync } from '@gsbelarus/util-helpers';

const find: FindHandler<IFilter> = async (
  sessionID,
  clause = {},
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

    const sql = `
      SELECT
        ID,
        USR$ENTITYNAME,
        USR$FILTERS
      FROM
        USR$CRM_FILTERS f
      ${clauseString.length > 0 ? ` WHERE ${clauseString}` : ''}`;

    const filters = await fetchAsObject<any> (sql, params);

    await forEachAsync<IFilter>(filters, async f => {
      const filter = await blob2String(f['USR$FILTERS']);
      f.filters = JSON.parse(filter);
      f.entityName = f['USR$ENTITYNAME'];
    });

    return filters;
  } finally {
    releaseReadTransaction();
  }
};

const findOne: FindOneHandler<ISegment> = async (sessionID, clause = {}) => {
  const filter = await find(sessionID, clause);

  if (filter.length === 0) {
    return Promise.resolve(undefined);
  }

  return filter[0];
};

const update: UpdateHandler<IFilter> = async (
  sessionID,
  id,
  metadata
) => {
  const { fetchAsSingletonObject, releaseTransaction, string2Blob } = await startTransaction(sessionID);

  try {
    const ID = id;

    const {
      filters,
      entityName
    } = metadata;

    const updatedFilter = await fetchAsSingletonObject<IFilter>(
      `UPDATE USR$CRM_FILTERS
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
  userId: number
}

const save: SaveHandler<IFilterSave> = async (
  sessionID,
  metadata
) => {
  const { fetchAsSingletonObject, releaseTransaction, string2Blob } = await startTransaction(sessionID);

  const { entityName, filters, userId } = metadata;

  try {
    const filter = await fetchAsSingletonObject<IFilterSave>(
      `INSERT INTO USR$CRM_FILTERS(USR$ENTITYNAME,USR$FILTERS,USR$USERKEY)
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

const remove: RemoveHandler = async (
  sessionID,
  id
) => {
  const { fetchAsSingletonObject, releaseTransaction } = await startTransaction(sessionID);

  try {
    const deletedFilter = await fetchAsSingletonObject<{ID: number}>(
      `DELETE FROM USR$CRM_FILTERS WHERE ID = :id
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
