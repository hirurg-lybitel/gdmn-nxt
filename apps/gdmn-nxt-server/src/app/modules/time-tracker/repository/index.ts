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
        USR$DATE ONDATE,
        USR$STARTTIME STARTTIME,
        USR$ENDTIME ENDTIME,
        USR$DURATION DURATION,
        USR$CUSTOMERKEY CUSTOMERKEY,
        USR$DESCRIPTION DESCRIPTION_BLOB,
        USR$INPROGRESS INPROGRESS,
        con.ID CON_ID,
        con.NAME CON_NAME,
        u.ID USER_ID,
        u.NAME USER_NAME,
        uc.ID as USER_CONTACT_ID,
        uc.NAME as USER_CONTACT_NAME,
        z.USR$BILLABLE BILLABLE,
        task.ID TASK_ID,
        task.USR$NAME TASK_NAME,
        pr.ID PROJECT_ID,
        pr.USR$NAME PROJECT_NAME
      FROM USR$CRM_TIMETRACKER z
      LEFT JOIN GD_CONTACT con ON con.ID = z.USR$CUSTOMERKEY
      LEFT JOIN GD_USER u ON u.ID = z.USR$USERKEY
      LEFT JOIN GD_CONTACT uc ON uc.ID = u.CONTACTKEY
      LEFT JOIN USR$CRM_TIMETRACKER_TASKS task ON task.ID = z.USR$TASK
      LEFT JOIN USR$CRM_TIMETRACKER_PROJECTS pr ON pr.ID = task.USR$PROJECT
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
      ...(r['CON_ID'] && {
        customer: {
          ID: r['CON_ID'],
          NAME: r['CON_NAME']
        }
      }),
      ...(r['USER_ID'] && {
        user: {
          ID: r['USER_ID'],
          NAME: r['USER_NAME'],
          CONTACT: {
            ID: r['USER_CONTACT_ID'],
            NAME: r['USER_CONTACT_NAME'],
          }
        }
      }),
      ...(r['TASK_ID'] && {
        task: {
          ID: r['TASK_ID'],
          name: r['TASK_NAME'],
          project: {
            ID: r['PROJECT_ID'],
            name: r['PROJECT_NAME']
          }
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
      billable = timeTrack.billable ?? true,
      task = timeTrack.task,
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
        z.USR$USERKEY = :userKey,
        z.USR$DESCRIPTION = :description,
        z.USR$BILLABLE = :billable,
        z.USR$TASK = :task
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
        userKey: user.ID ?? null,
        billable: Number(billable),
        task: task?.ID ?? null,
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
    billable = true,
    task
  } = metadata;

  try {
    const newTimeTrack = await fetchAsSingletonObject<ITimeTrack>(
      `INSERT INTO USR$CRM_TIMETRACKER(USR$DATE, USR$STARTTIME, USR$ENDTIME, USR$DURATION,
        USR$INPROGRESS, USR$DESCRIPTION, USR$CUSTOMERKEY, USR$USERKEY, USR$BILLABLE, USR$TASK)
      VALUES(:date, :startTime, :endTime, :duration, :inProgress, :description, :customerKey, :userKey, :billable, :task)
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
        billable: Number(billable),
        task: task?.ID ?? null
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
