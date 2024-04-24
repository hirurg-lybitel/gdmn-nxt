import { cacheManager } from '@gdmn-nxt/cache-manager';
import { acquireReadTransaction, releaseReadTransaction } from '@gdmn-nxt/db-connection';
import { ArrayElement, FindHandler, FindOneHandler, ISegment, ISegmnentFields } from '@gsbelarus/util-api-types';
import { forEachAsync } from '@gsbelarus/util-helpers';
import { Customer } from '../../utils/cached requests';
import { customersRepository } from '../customers';

const find: FindHandler<ISegment> = async (sessionID, clause = {}) => {
  const { fetchAsObject, releaseReadTransaction } = await acquireReadTransaction(sessionID);

  try {
    const clauseString = Object
      .keys({ ...clause })
      .map(f => ` s.${f} = :${f}`)
      .join(' AND ');

    let sql = `
      SELECT
        s.ID,
        USR$NAME NAME
      FROM
        USR$CRM_MARKETING_SEGMENTS s
      ${clauseString.length > 0 ? ` WHERE ${clauseString}` : ''}`;

    const segments = await fetchAsObject<Pick<ISegment, 'ID' | 'NAME'>>(sql, { ...clause });

    sql = `
      SELECT
        l.USR$FIELDNAME NAME,
        l.USR$VALUE "VALUE"
      FROM USR$CRM_MARKETING_SEGMENTS_LINE l
      WHERE l.USR$MASTERKEY = :masterKey`;


    const result: ISegment[] = [];

    await forEachAsync(segments, async (s) => {
      const segmentDetails = await fetchAsObject<ISegmnentFields>(sql, { masterKey: s.ID });

      const flatSegmentDetails = new Map();

      await forEachAsync(segmentDetails, async s => {
        flatSegmentDetails.set(s.NAME, s.VALUE);
      });

      const LABELS = flatSegmentDetails.get('LABELS') ?? '';

      const customers = await customersRepository.find('', {
        LABELS
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


export const segmentsRepository = {
  find,
  findOne
};
