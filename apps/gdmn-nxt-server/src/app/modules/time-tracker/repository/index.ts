import { adjustRelationName } from '@gdmn-nxt/controllers/er/at-utils';
import { acquireReadTransaction, startTransaction } from '@gdmn-nxt/db-connection';
import { FindHandler, FindOneHandler, FindOperator, ITimeTrack, RemoveHandler, SaveHandler, UpdateHandler } from '@gsbelarus/util-api-types';

const find: FindHandler<ITimeTrack> = async (
  sessionID,
  clause
) => {
  const {
    fetchAsObject,
    releaseReadTransaction,
    blob2String
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
          }
        }

        whereClause[adjustRelationName(f)] = clause[f];
        return ` z.${f} = :${adjustRelationName(f)}`;
      })
      .join(' AND ');

    const rows = await fetchAsObject(
      `SELECT
        z.ID,
        USR$DATE ONDATE,
        USR$STARTTIME STARTTIME,
        USR$ENDTIME ENDTIME,
        USR$DURATION DURATION,
        USR$WORKTYPEKEY WORKTYPEKEY,
        USR$CUSTOMERKEY CUSTOMERKEY,
        USR$DESCRIPTION DESCRIPTION_BLOB,
        USR$INPROGRESS INPROGRESS,
        tt.ID WORK_ID,
        tt.USR$NAME WORK_NAME,
        con.ID CON_ID,
        con.NAME CON_NAME,
        u.ID USER_ID,
        u.NAME USER_NAME,
        z.USR$BILLABLE BILLABLE
      FROM USR$CRM_TIMETRACKER z
      JOIN USR$CRM_TIMETRACKER_TYPES tt ON tt.ID = z.USR$WORKTYPEKEY
      LEFT JOIN GD_CONTACT con ON con.ID = z.USR$CUSTOMERKEY
      LEFT JOIN GD_USER u ON u.ID = z.USR$USERKEY
      ${clauseString.length > 0 ? ` WHERE ${clauseString}` : ''}
      ORDER BY z.USR$DATE DESC, z.USR$ENDTIME DESC`,
      { ...whereClause });


    const timeTracking: ITimeTrack[] = await Promise.all(rows.map(async r => ({
      ID: r['ID'],
      date: r['ONDATE'],
      startTime: r['STARTTIME'],
      endTime: r['ENDTIME'],
      duration: r['DURATION'] ?? '',
      inProgress: r['INPROGRESS'] === 1,
      billable: r['BILLABLE'] === 1,
      description: await blob2String(r['DESCRIPTION_BLOB']),
      ...(r['WORK_ID'] && {
        workProject: {
          ID: r['WORK_ID'],
          NAME: r['WORK_NAME']
        }
      }),
      ...(r['CON_ID'] && {
        customer: {
          ID: r['CON_ID'],
          NAME: r['CON_NAME']
        }
      }),
      ...(r['USER_ID'] && {
        user: {
          ID: r['USER_ID'],
          NAME: r['USER_NAME']
        }
      })
    })));

    return timeTracking;
  } finally {
    releaseReadTransaction();
  }
};

const findOne: FindOneHandler<ITimeTrack> = async (
  sessionID,
  clause = {}
) => {
  const rows = await find(sessionID, clause);

  if (rows.length === 0) {
    return Promise.resolve(undefined);
  }

  return rows[0];
};

const update: UpdateHandler<ITimeTrack> = async (
  sessionID,
  id,
  metadata
) => {
  const {
    fetchAsSingletonObject,
    releaseTransaction,
    string2Blob
  } = await startTransaction(sessionID);

  try {
    const timeTrack = await findOne(sessionID, { id });

    const {
      date = timeTrack.date,
      startTime = timeTrack.startTime,
      endTime = timeTrack.endTime,
      duration = timeTrack.duration,
      customer = timeTrack.customer,
      description = timeTrack.description,
      inProgress = timeTrack.inProgress,
      user = timeTrack.user,
      workProject = timeTrack.workProject,
      billable = timeTrack.billable ?? true,
    } = metadata;

    const updatedTimeTrack = await fetchAsSingletonObject<ITimeTrack>(
      `UPDATE USR$CRM_TIMETRACKER z
      SET
        z.USR$DATE = :onDate,
        z.USR$STARTTIME = :startTime,
        z.USR$ENDTIME = :endTime,
        z.USR$DURATION = :duration,
        z.USR$INPROGRESS = :inProgress,
        z.USR$CUSTOMERKEY = :customerKey,
        z.USR$WORKTYPEKEY = :workTypeKey,
        z.USR$USERKEY = :userKey,
        z.USR$DESCRIPTION = :description,
        z.USR$BILLABLE = :billable
      WHERE
        ID = :id
      RETURNING ID`,
      {
        id,
        onDate: new Date(date),
        startTime: startTime ? new Date(startTime) : null,
        endTime: startTime ? new Date(endTime) : null,
        duration,
        description: await string2Blob(description),
        inProgress: Number(inProgress),
        customerKey: customer.ID ?? null,
        workTypeKey: workProject.ID ?? null,
        userKey: user.ID ?? null,
        billable: Number(billable)
      }
    );
    await releaseTransaction();

    return updatedTimeTrack;
  } catch (error) {
    await releaseTransaction(false);
    throw new Error(error);
  }
};

const save: SaveHandler<ITimeTrack> = async (
  sessionID,
  metadata
) => {
  const {
    fetchAsSingletonObject,
    releaseTransaction,
    string2Blob
  } = await startTransaction(sessionID);

  const {
    date,
    startTime,
    endTime,
    duration,
    customer,
    description,
    inProgress,
    user,
    workProject,
    billable = true
  } = metadata;

  try {
    const newTimeTrack = await fetchAsSingletonObject<ITimeTrack>(
      `INSERT INTO USR$CRM_TIMETRACKER(USR$DATE, USR$STARTTIME, USR$ENDTIME, USR$DURATION,
        USR$INPROGRESS, USR$DESCRIPTION, USR$CUSTOMERKEY, USR$USERKEY, USR$WORKTYPEKEY, USR$BILLABLE)
      VALUES(:date, :startTime, :endTime, :duration, :inProgress, :description, :customerKey, :userKey, :workTypeKey, :billable)
      RETURNING ID`,
      {
        date: new Date(date),
        startTime: startTime ? new Date(startTime) : null,
        endTime: startTime ? new Date(endTime) : null,
        duration,
        inProgress: Number(inProgress),
        description: await string2Blob(description),
        customerKey: customer.ID ?? null,
        userKey: user.ID ?? null,
        workTypeKey: workProject.ID ?? null,
        billable: Number(billable)
      }
    );

    await releaseTransaction();
    const timeTrack = await findOne(sessionID, { ID: newTimeTrack.ID });

    return timeTrack;
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
      `DELETE FROM USR$CRM_TIMETRACKER WHERE ID = :id
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

export const timeTrackingRepository = {
  find,
  findOne,
  update,
  save,
  remove
};
