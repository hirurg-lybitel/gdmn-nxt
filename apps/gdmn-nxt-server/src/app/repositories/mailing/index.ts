import { acquireReadTransaction } from '@gdmn-nxt/db-connection';
import { FindHandler, FindOneHandler, IMailing, ISegment } from '@gsbelarus/util-api-types';
import { forEachAsync } from '@gsbelarus/util-helpers';
import { segmentsRepository } from '../segments';

const find: FindHandler<IMailing> = async (sessionID, clause = {}) => {
  const { fetchAsObject, releaseReadTransaction } = await acquireReadTransaction(sessionID);

  try {
    const clauseString = Object
      .keys({ ...clause })
      .map(f => ` m.${f} = :${f}`)
      .join(' AND ');

    let sql = `
      SELECT
        m.ID,
        m.USR$NAME NAME,
        m.USR$LAUNCHDATE LAUNCHDATE,
        IIF(m.USR$STATUS IS NULL, 0, m.USR$STATUS) STATUS
      FROM USR$CRM_MARKETING_MAILING m
      ${clauseString.length > 0 ? ` WHERE ${clauseString}` : ''}`;

    const mailing = await fetchAsObject<Omit<IMailing, 'segments'>>(sql, { ...clause });

    if (mailing.length === 0) {
      return [];
    }

    sql = `
      SELECT
        l.USR$SEGMENTKEY
      FROM USR$CRM_MARKETING_MAILING_LINE l
      LEFT JOIN USR$CRM_MARKETING_SEGMENTS s ON s.ID = l.USR$SEGMENTKEY
      WHERE l.USR$MASTERKEY = :masterKey`;


    const result: IMailing[] = [];

    await forEachAsync(mailing, async (m) => {
      const segmentIds = await fetchAsObject(sql, { masterKey: m.ID });

      const segments: ISegment[] = [];

      await forEachAsync(segmentIds, async s => {
        const fullSegment = await segmentsRepository.findOne(sessionID, { ID: s['USR$SEGMENTKEY'] });
        segments.push(fullSegment);
      });

      result.push({
        ...m,
        segments
      });
    });

    return result;
  } finally {
    releaseReadTransaction();
  }
};

const findOne: FindOneHandler<IMailing> = async (sessionID, clause = {}) => {
  const mailing = await find(sessionID, clause);

  if (mailing.length === 0) {
    return Promise.resolve(undefined);
  }

  return mailing[0];
};

export const mailingRepository = {
  find,
  findOne
};
