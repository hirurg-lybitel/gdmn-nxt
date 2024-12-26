import { adjustRelationName } from '@gdmn-nxt/controllers/er/at-utils';
import { acquireReadTransaction, startTransaction } from '@gdmn-nxt/db-connection';
import { customersService } from '@gdmn-nxt/modules/customers/service';
import { ArrayElement, FindHandler, FindOneHandler, FindOperator, ISegment, ISegmnentField, RemoveOneHandler, SaveHandler, UpdateHandler } from '@gsbelarus/util-api-types';
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

    const customersRows = await fetchAsObject(
      `SELECT
        USR$MASTERKEY MASTERKEY, USR$CUSTOMERKEY CUSTOMERKEY
      FROM USR$CRM_MARKETING_SEGMENTS_CUST
      ORDER BY USR$MASTERKEY`);


    const customersMap = new Map<number, number[]>();
    customersRows.forEach(c => {
      const customerIds = customersMap.get(c['MASTERKEY']) ?? [];

      customersMap.set(c['MASTERKEY'], [...customerIds, c['CUSTOMERKEY']]);
    });

    const result: ISegment[] = [];

    // TODO: ускорить/переписать

    await forEachAsync(segments, async (s) => {
      const segmentDetails = await fetchAsObject<ISegmnentField>(sql, { masterKey: s.ID });

      const flatSegmentDetails = new Map();

      await forEachAsync(segmentDetails, async s => {
        flatSegmentDetails.set(s.NAME, s.VALUE);
      });

      const LABELS = flatSegmentDetails.get('LABELS') ?? '';
      const DEPARTMENTS = flatSegmentDetails.get('DEPARTMENTS') ?? '';
      const BUSINESSPROCESSES = flatSegmentDetails.get('BUSINESSPROCESSES') ?? '';
      const CONTRACTS = flatSegmentDetails.get('CUSTOMERCONTRACTS') ?? '';
      const WORKTYPES = flatSegmentDetails.get('WORKTYPES') ?? '';

      const customers = await customersService.find('', {
        LABELS,
        DEPARTMENTS,
        BUSINESSPROCESSES,
        CONTRACTS,
        WORKTYPES
      });

      const directCustomersIds = customersMap.get(s.ID) ?? [];

      const newSegment: ArrayElement<typeof result> = {
        ...s,
        FIELDS: [...segmentDetails],
        QUANTITY: directCustomersIds.length > 0 ? directCustomersIds.length : customers.length,
        CUSTOMERS: directCustomersIds
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
      CUSTOMERS = segment.CUSTOMERS
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

    const deleteSegmentLines = await executeSingleton(
      `DELETE FROM USR$CRM_MARKETING_SEGMENTS_LINE
      WHERE USR$MASTERKEY = :MASTERKEY`,
      {
        MASTERKEY: id
      });

    const sql = `
      INSERT INTO USR$CRM_MARKETING_SEGMENTS_LINE(USR$MASTERKEY, USR$FIELDNAME, USR$VALUE)
      VALUES(:MASTERKEY, :FIELDNAME, :VALUE)`;

    const insertSegmentLines = FIELDS.map(async ({ NAME, VALUE }) =>
      await executeSingleton(sql, {
        MASTERKEY: id,
        FIELDNAME: NAME,
        VALUE
      })
    );

    const deleteSegmentCustomers = await executeSingleton(
      `DELETE FROM USR$CRM_MARKETING_SEGMENTS_CUST
      WHERE USR$MASTERKEY = :MASTERKEY`,
      {
        MASTERKEY: id
      });

    const insertSegmentCustomers = CUSTOMERS?.map(async (customerId) =>
      await executeSingleton(
        `INSERT INTO USR$CRM_MARKETING_SEGMENTS_CUST (USR$MASTERKEY, USR$CUSTOMERKEY)
        VALUES(:MASTERKEY, :CUSTOMERKEY)`,
        {
          MASTERKEY: id,
          CUSTOMERKEY: customerId
        })
    );

    await Promise.all([deleteSegmentLines, ...insertSegmentLines, deleteSegmentCustomers, ...insertSegmentCustomers]);

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
  const { fetchAsSingletonObject, releaseTransaction, executeSingleton } = await startTransaction(sessionID);

  const {
    NAME,
    FIELDS,
    CUSTOMERS
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

    const insertSegmentCustomers = CUSTOMERS?.map(async (customerId) =>
      await executeSingleton(
        `INSERT INTO USR$CRM_MARKETING_SEGMENTS_CUST (USR$MASTERKEY, USR$CUSTOMERKEY)
        VALUES(:MASTERKEY, :CUSTOMERKEY)`,
        {
          MASTERKEY: segment.ID,
          CUSTOMERKEY: customerId
        })
    );

    await Promise.all([...insertSegmentLines, ...insertSegmentCustomers]);

    await releaseTransaction();

    return segment;
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
