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
        USR$ENTITYNAME as entityName,
        USR$FILTERS as filters
      FROM
        USR$CRM_FILTERS f
      ${clauseString.length > 0 ? ` WHERE ${clauseString}` : ''}`;

    const filters = await fetchAsObject<any> (sql, params);

    await forEachAsync(filters, async f => {
      const filter = await blob2String(f['FILTERS']);

      f['FILTERS'] = JSON.parse(filter);
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
      FILTERS,
      ENTITYNAME
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
        ENTITYNAME: ENTITYNAME,
        FILTERS: await string2Blob(JSON.stringify(FILTERS)),
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

  const { ENTITYNAME, FILTERS, userId } = metadata;

  try {
    const segment = await fetchAsSingletonObject<any>(
      `INSERT INTO USR$CRM_FILTERS(USR$ENTITYNAME,USR$FILTERS,USR$USERKEY)
      VALUES(:ENTITYNAME,:FILTERS,:USERKEY)
      RETURNING ID`,
      {
        ENTITYNAME: ENTITYNAME,
        FILTERS: await string2Blob(JSON.stringify(FILTERS)),
        USERKEY: userId
      }
    );

    await releaseTransaction();

    return segment;
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
