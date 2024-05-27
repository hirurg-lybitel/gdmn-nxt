import { adjustRelationName } from '@gdmn-nxt/controllers/er/at-utils';
import { acquireReadTransaction, startTransaction } from '@gdmn-nxt/db-connection';
import { customersRepository } from '@gdmn-nxt/repositories/customers';
import { ArrayElement, FindHandler, FindOneHandler, FindOperator, ISegment, ISegmnentField, RemoveHandler, SaveHandler, UpdateHandler } from '@gsbelarus/util-api-types';
import { forEachAsync } from '@gsbelarus/util-helpers';

const find: FindHandler<ISegment> = async (
  sessionID,
  clause = {},
  order = { NAME: 'ASC' }
) => {
  const { fetchAsObject, releaseReadTransaction } = await acquireReadTransaction(sessionID);

  try {
    const clauseString = Object
      .keys({ ...clause })
      .map(f => {
        if (typeof clause[f] === 'object' && 'operator' in clause[f]) {
          const expression = clause[f] as FindOperator;
          switch (expression.operator) {
            case 'LIKE':
              return ` UPPER(s.${f}) ${expression.value} `;
          }
        }

        return ` s.${f} = :${adjustRelationName(f)}`;
      })
      .join(' AND ');

    let sql = `
      SELECT
        s.ID,
        USR$NAME NAME
      FROM
        USR$CRM_MARKETING_SEGMENTS s
      ${clauseString.length > 0 ? ` WHERE ${clauseString}` : ''}
      ${order ? ` ORDER BY ${Object.keys(order)[0]} ${Object.values(order)[0]}` : ''}`;

    const segments = await fetchAsObject<Pick<ISegment, 'ID' | 'NAME'>>(sql, { ...clause });

    sql = `
      SELECT
        l.USR$FIELDNAME NAME,
        l.USR$VALUE "VALUE"
      FROM USR$CRM_MARKETING_SEGMENTS_LINE l
      WHERE l.USR$MASTERKEY = :masterKey`;


    const result: ISegment[] = [];

    await forEachAsync(segments, async (s) => {
      const segmentDetails = await fetchAsObject<ISegmnentField>(sql, { masterKey: s.ID });

      const flatSegmentDetails = new Map();

      await forEachAsync(segmentDetails, async s => {
        flatSegmentDetails.set(s.NAME, s.VALUE);
      });

      const LABELS = flatSegmentDetails.get('LABELS') ?? '';
      const DEPARTMENTS = flatSegmentDetails.get('DEPARTMENTS') ?? '';

      const customers = await customersRepository.find('', {
        LABELS,
        DEPARTMENTS
      });

      const newSegment: ArrayElement<typeof result> = {
        ...s,
        FIELDS: [...segmentDetails],
        QUANTITY: customers.length
      };

      result.push(newSegment);
    });

    return result;
  } finally {
    releaseReadTransaction();
  }
};

const findOne: FindOneHandler<ISegment> = async (sessionID, clause = {}) => {
  const segments = await find(sessionID, clause);

  if (segments.length === 0) {
    return Promise.resolve(undefined);
  }

  return segments[0];
};

const update: UpdateHandler<ISegment> = async (
  sessionID,
  id,
  metadata
) => {
  const { fetchAsSingletonObject, executeSingleton, releaseTransaction } = await startTransaction(sessionID);

  try {
    const segment = await findOne(sessionID, { id });

    const ID = id;

    const {
      NAME = segment.NAME,
      FIELDS = segment.FIELDS,
    } = metadata;

    const updatedSegment = await fetchAsSingletonObject<ISegment>(
      `UPDATE USR$CRM_MARKETING_SEGMENTS
      SET
        USR$NAME = :NAME
      WHERE
        ID = :ID
      RETURNING ID`,
      {
        ID,
        NAME
      }
    );

    const deleteSegmentLines = executeSingleton(
      `DELETE FROM USR$CRM_MARKETING_SEGMENTS_LINE
      WHERE USR$MASTERKEY = :MASTERKEY`,
      {
        MASTERKEY: id
      });

    const sql = `
      INSERT INTO USR$CRM_MARKETING_SEGMENTS_LINE(USR$MASTERKEY, USR$FIELDNAME, USR$VALUE)
      VALUES(:MASTERKEY, :FIELDNAME, :VALUE)`;

    const insertSegmentLines = FIELDS.map(async ({ NAME, VALUE }) =>
      executeSingleton(sql, {
        MASTERKEY: id,
        FIELDNAME: NAME,
        VALUE
      })
    );

    await Promise.all([deleteSegmentLines, ...insertSegmentLines]);

    await releaseTransaction();

    return updatedSegment;
  } catch (error) {
    await releaseTransaction(false);
    throw new Error(error);
  }
};

const save: SaveHandler<ISegment> = async (
  sessionID,
  metadata
) => {
  const { fetchAsSingletonObject, releaseTransaction } = await startTransaction(sessionID);

  const {
    NAME,
    FIELDS
  } = metadata;

  try {
    const segment = await fetchAsSingletonObject<ISegment>(
      `INSERT INTO USR$CRM_MARKETING_SEGMENTS(USR$NAME)
      VALUES(:NAME)
      RETURNING ID`,
      {
        NAME
      }
    );

    const sql = `
      INSERT INTO USR$CRM_MARKETING_SEGMENTS_LINE(USR$MASTERKEY, USR$FIELDNAME, USR$VALUE)
      VALUES(:MASTERKEY, :FIELDNAME, :VALUE)
      RETURNING ID`;

    const insertSegmentLines = FIELDS.map(async ({ NAME, VALUE }) =>
      fetchAsSingletonObject(sql, {
        MASTERKEY: segment.ID,
        FIELDNAME: NAME,
        VALUE
      })
    );

    await Promise.all(insertSegmentLines);

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
    const deletedMailing = await fetchAsSingletonObject<{ID: number}>(
      `DELETE FROM USR$CRM_MARKETING_SEGMENTS WHERE ID = :id
      RETURNING ID`,
      { id }
    );

    await releaseTransaction();

    return !!deletedMailing.ID;
  } catch (error) {
    await releaseTransaction(false);
    throw new Error(error);
  }
};

export const segmentsRepository = {
  find,
  findOne,
  update,
  save,
  remove
};
