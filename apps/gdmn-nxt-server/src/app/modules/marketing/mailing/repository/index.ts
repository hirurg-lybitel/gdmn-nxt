import { acquireReadTransaction, startTransaction } from '@gdmn-nxt/db-connection';
import { FindHandler, FindOneHandler, FindOperator, IMailing, ISegment, IsNotNull, IsNull, RemoveHandler, SaveHandler, UpdateHandler } from '@gsbelarus/util-api-types';
import { forEachAsync } from '@gsbelarus/util-helpers';
import { adjustRelationName } from '@gdmn-nxt/controllers/er/at-utils';
import { segmentsRepository } from '@gdmn-nxt/modules/marketing/segments/repository';

const find: FindHandler<IMailing> = async (sessionID, clause = {}) => {
  const { fetchAsObject, releaseReadTransaction, blob2String } = await acquireReadTransaction(sessionID);

  try {
    const whereClause = {};
    const clauseString = Object
      .keys({ ...clause })
      .map(f => {
        if (typeof clause[f] === 'object' && 'operator' in clause[f]) {
          const expression = clause[f] as FindOperator;
          switch (expression.operator) {
            case 'LIKE':
              return ` UPPER(m.${f}) ${expression.value} `;
            case 'IsNull':
              return ` m.${f} IS NULL`;
            case 'IsNotNull':
              return ` m.${f} IS NOT NULL`;
          }
        }
        whereClause[adjustRelationName(f)] = clause[f];
        return ` m.${f} = :${adjustRelationName(f)}`;
      })
      .join(' AND ');

    let sql = `
      SELECT
        m.ID,
        m.USR$NAME NAME,
        m.USR$LAUNCHDATE LAUNCHDATE,
        m.USR$STARTDATE STARTDATE,
        m.USR$FINISHDATE FINISHDATE,
        COALESCE(m.USR$STATUS, 0) AS STATUS,
        m.USR$STATUS_DESCRIPTION STATUS_DESCRIPTION,
        USR$TEMPLATE TEMPLATE_BLOB,
        USR$TESTING_EMAILS TESTING_EMAILS
      FROM USR$CRM_MARKETING_MAILING m
      ${clauseString.length > 0 ? ` WHERE ${clauseString}` : ''}`;

    const mailing = await fetchAsObject<Omit<IMailing, 'includeSegments' | 'excludeSegments'>>(sql, { ...whereClause });

    if (mailing.length === 0) {
      return [];
    }

    sql = `
      SELECT
        l.USR$INCLUDE_SEGMENT,
        l.USR$EXCLUDE_SEGMENT
      FROM USR$CRM_MARKETING_MAILING_LINE l
      JOIN USR$CRM_MARKETING_SEGMENTS s ON s.ID = l.USR$INCLUDE_SEGMENT OR s.ID = l.USR$EXCLUDE_SEGMENT
      WHERE l.USR$MASTERKEY = :masterKey`;


    const result: IMailing[] = [];

    // TODO: переписть для скорости

    await forEachAsync(mailing, async (m) => {
      const segmentIds = await fetchAsObject(sql, { masterKey: m.ID });

      const includeSegments: ISegment[] = [];
      const excludeSegments: ISegment[] = [];

      await forEachAsync(segmentIds, async s => {
        if (s['USR$INCLUDE_SEGMENT'] > 0) {
          const fullSegment = await segmentsRepository.findOne(sessionID, { ID: s['USR$INCLUDE_SEGMENT'] });
          includeSegments.push(fullSegment);
        }
        if (s['USR$EXCLUDE_SEGMENT'] > 0) {
          const fullSegment = await segmentsRepository.findOne(sessionID, { ID: s['USR$EXCLUDE_SEGMENT'] });
          excludeSegments.push(fullSegment);
        }
      });

      const convertedTemplate = await blob2String(m['TEMPLATE_BLOB']);
      delete m['TEMPLATE_BLOB'];

      const arrayEmails = (m['TESTING_EMAILS'] as string)?.split(',') ?? [];
      delete m['TESTING_EMAILS'];

      result.push({
        ...m,
        TEMPLATE: convertedTemplate,
        includeSegments,
        excludeSegments,
        testingEmails: arrayEmails
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

const update: UpdateHandler<IMailing> = async (
  sessionID,
  id,
  metadata
) => {
  const { fetchAsSingletonObject, executeSingleton, releaseTransaction, string2Blob } = await startTransaction(sessionID);

  try {
    const mailing = await findOne(sessionID, { id });

    const ID = id;

    const {
      LAUNCHDATE = mailing.LAUNCHDATE,
      STARTDATE = mailing.STARTDATE,
      FINISHDATE = mailing.FINISHDATE,
      NAME = mailing.NAME,
      STATUS = mailing.STATUS,
      STATUS_DESCRIPTION = mailing.STATUS_DESCRIPTION,
      TEMPLATE = mailing.TEMPLATE,
      includeSegments = mailing.includeSegments,
      excludeSegments = mailing.excludeSegments,
      testingEmails = mailing.testingEmails
    } = metadata;

    const result = await fetchAsSingletonObject<IMailing>(
      `UPDATE USR$CRM_MARKETING_MAILING C
      SET
        USR$LAUNCHDATE = :LAUNCHDATE,
        USR$NAME = :NAME,
        USR$STATUS = :STATUS,
        USR$STATUS_DESCRIPTION = :STATUS_DESCRIPTION,
        USR$TEMPLATE = :TEMPLATE,
        USR$FINISHDATE = :FINISHDATE,
        USR$STARTDATE = :STARTDATE,
        USR$TESTING_EMAILS = :TESTING_EMAILS
      WHERE
        ID = :ID
      RETURNING ID`,
      {
        ID,
        LAUNCHDATE: new Date(LAUNCHDATE),
        STARTDATE: new Date(STARTDATE),
        FINISHDATE: new Date(FINISHDATE),
        NAME,
        STATUS,
        STATUS_DESCRIPTION,
        TEMPLATE: await string2Blob(TEMPLATE),
        TESTING_EMAILS: testingEmails.join(',')
      }
    );

    const deleteSegments = executeSingleton(
      `DELETE FROM USR$CRM_MARKETING_MAILING_LINE
      WHERE USR$MASTERKEY = :MASTERKEY`,
      {
        MASTERKEY: id
      });

    const sql = `
      INSERT INTO USR$CRM_MARKETING_MAILING_LINE(USR$MASTERKEY, USR$INCLUDE_SEGMENT, USR$EXCLUDE_SEGMENT)
      VALUES(:MASTERKEY, :INCLUDE_SEGMENTKEY, :EXCLUDE_SEGMENTKEY)
      RETURNING ID`;

    const insertIncludeSegments = includeSegments.map(async s => {
      return fetchAsSingletonObject(sql, {
        MASTERKEY: mailing.ID,
        INCLUDE_SEGMENTKEY: s.ID,
        EXCLUDE_SEGMENTKEY: null
      });
    });

    const insertExcludeSegments = excludeSegments.map(async s => {
      return fetchAsSingletonObject(sql, {
        MASTERKEY: mailing.ID,
        INCLUDE_SEGMENTKEY: null,
        EXCLUDE_SEGMENTKEY: s.ID
      });
    });

    await Promise.all([deleteSegments, ...insertIncludeSegments, ...insertExcludeSegments]);

    await releaseTransaction();

    return result;
  } catch (error) {
    await releaseTransaction(false);
    throw new Error(error);
  }
};

const save: SaveHandler<IMailing> = async (
  sessionID,
  metadata
) => {
  const { fetchAsSingletonObject, releaseTransaction, string2Blob } = await startTransaction(sessionID);

  const {
    NAME,
    TEMPLATE,
    includeSegments,
    excludeSegments,
    LAUNCHDATE,
    testingEmails = []
  } = metadata;

  try {
    const mailing = await fetchAsSingletonObject<IMailing>(
      `INSERT INTO USR$CRM_MARKETING_MAILING(USR$NAME, USR$TEMPLATE, USR$STATUS, USR$LAUNCHDATE, USR$TESTING_EMAILS)
      VALUES(:NAME, :TEMPLATE, :STATUS, :LAUNCHDATE, :TESTING_EMAILS)
      RETURNING ID`,
      {
        NAME,
        TEMPLATE: await string2Blob(TEMPLATE),
        STATUS: 0,
        LAUNCHDATE: new Date(LAUNCHDATE),
        TESTING_EMAILS: testingEmails.join(',')
      }
    );

    const sql = `
      INSERT INTO USR$CRM_MARKETING_MAILING_LINE(USR$MASTERKEY, USR$INCLUDE_SEGMENT, USR$EXCLUDE_SEGMENT)
      VALUES(:MASTERKEY, :INCLUDE_SEGMENTKEY, :EXCLUDE_SEGMENTKEY)
      RETURNING ID`;

    const insertIncludeSegments = includeSegments.map(async s => {
      return fetchAsSingletonObject(sql, {
        MASTERKEY: mailing.ID,
        INCLUDE_SEGMENTKEY: s.ID,
        EXCLUDE_SEGMENTKEY: null
      });
    });

    const insertExcludeSegments = excludeSegments.map(async s => {
      return fetchAsSingletonObject(sql, {
        MASTERKEY: mailing.ID,
        INCLUDE_SEGMENTKEY: null,
        EXCLUDE_SEGMENTKEY: s.ID
      });
    });

    await Promise.all([...insertIncludeSegments, ...insertExcludeSegments]);

    await releaseTransaction();

    return mailing;
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
      `DELETE FROM USR$CRM_MARKETING_MAILING WHERE ID = :id
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

export const mailingRepository = {
  find,
  findOne,
  update,
  save,
  remove
};
