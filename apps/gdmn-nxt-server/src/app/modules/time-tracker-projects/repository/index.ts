import { adjustRelationName } from '@gdmn-nxt/controllers/er/at-utils';
import { acquireReadTransaction, startTransaction } from '@gdmn-nxt/db-connection';
import { timeTrackerTasksService } from '@gdmn-nxt/modules/time-tracker-tasks/service';
import { FindHandler, FindOneHandler, FindOperator, IContactPerson, IProjectNote, ITimeTrackProject, RemoveHandler, SaveHandler, UpdateHandler } from '@gsbelarus/util-api-types';

const find: FindHandler<ITimeTrackProject> = async (
  sessionID,
  clause,
  order = { 'USR$NAME': 'ASC' }
) => {
  const {
    fetchAsObject,
    releaseReadTransaction,
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
        z.USR$NAME NAME,
        z.USR$CUSTOMER CUSTOMER_ID,
        con.NAME CUSTOMER_NAME
      FROM USR$CRM_TIMETRACKER_PROJECTS z
      JOIN GD_CONTACT con ON con.ID = z.USR$CUSTOMER
      ${clauseString.length > 0 ? ` WHERE ${clauseString}` : ''}
      ${order ? ` ORDER BY z.${Object.keys(order)[0]} ${Object.values(order)[0]}` : ''}`,
      { ...whereClause });

    const projects: ITimeTrackProject[] = rows.map(r => ({
      ID: r['ID'],
      name: r['NAME'],
      customer: {
        ID: r['CUSTOMER_ID'],
        NAME: r['CUSTOMER_NAME']
      }
    }));

    return projects;
  } finally {
    releaseReadTransaction();
  }
};

const findOne: FindOneHandler<ITimeTrackProject> = async (
  sessionID,
  clause = {}
) => {
  const rows = await find(sessionID, clause);

  if (rows.length === 0) {
    return Promise.resolve(undefined);
  }

  return rows[0];
};

const update: UpdateHandler<ITimeTrackProject> = async (
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
    return {} as any;
    const timeTrack = await findOne(sessionID, { id });

    // const {
    //   date = timeTrack.date,
    //   startTime = timeTrack.startTime,
    //   endTime = timeTrack.endTime,
    //   duration = timeTrack.duration,
    //   customer = timeTrack.customer,
    //   description = timeTrack.description,
    //   inProgress = timeTrack.inProgress,
    //   user = timeTrack.user,
    //   billable = timeTrack.billable ?? true,
    //   task = timeTrack.task,
    // } = metadata;

    // const updatedTimeTrack = await fetchAsSingletonObject<ITimeTrackProject>(
    //   `UPDATE USR$CRM_TIMETRACKER z
    //   SET
    //     z.USR$DATE = :onDate,
    //     z.USR$STARTTIME = :startTime,
    //     z.USR$ENDTIME = :endTime,
    //     z.USR$DURATION = :duration,
    //     z.USR$INPROGRESS = :inProgress,
    //     z.USR$CUSTOMERKEY = :customerKey,
    //     z.USR$USERKEY = :userKey,
    //     z.USR$DESCRIPTION = :description,
    //     z.USR$BILLABLE = :billable,
    //     z.USR$TASK = :task
    //   WHERE
    //     ID = :id
    //   RETURNING ID`,
    //   {
    //     id,
    //     onDate: new Date(date),
    //     startTime: startTime ? new Date(startTime) : null,
    //     endTime: startTime ? new Date(endTime) : null,
    //     duration,
    //     description: await string2Blob(description),
    //     inProgress: Number(inProgress),
    //     customerKey: customer.ID ?? null,
    //     userKey: user.ID ?? null,
    //     billable: Number(billable),
    //     task: task?.ID ?? null,
    //   }
    // );
    // await releaseTransaction();

    // return updatedTimeTrack;
  } catch (error) {
    await releaseTransaction(false);
    throw new Error(error);
  }
};

const save: SaveHandler<ITimeTrackProject> = async (
  sessionID,
  metadata
) => {
  const {
    fetchAsSingletonObject,
    releaseTransaction,
    executeQuery,
    string2Blob
  } = await startTransaction(sessionID);

  const {
    name,
    customer,
    isDone,
    isPrivate,
    tasks,
    employees,
    notes,
  } = metadata;

  try {
    const newProject = await fetchAsSingletonObject<ITimeTrackProject>(
      `INSERT INTO USR$CRM_TIMETRACKER_PROJECTS(USR$NAME, USR$CUSTOMER, USR$DONE, USR$PRIVATE)
      VALUES(:name, :customer, :isDone, :isPrivate)
      RETURNING ID`,
      {
        name,
        customer: customer.ID,
        isDone,
        isPrivate
      }
    );

    // const newTasks = Promise.all(tasks.map(async task => {
    //   return await timeTrackerTasksService.create(sessionID, { ...task, project: newProject });
    // }));

    console.log('------');

    const newEmployees = employees && Promise.all(employees.map(async empl => {
      return await fetchAsSingletonObject<IContactPerson>(
        `INSERT INTO USR$CRM_TT_PROJECTS_EMPLOYEES(USR$PROJECT, USR$CONTACTKEY)
        VALUES(:project, :contactKey)
        RETURNING ID`,
        {
          project: newProject.ID,
          contactKey: empl.ID
        }
      );
    }));

    console.log('_-----_');

    fetchAsSingletonObject<IProjectNote>(
      `INSERT INTO USR$CRM_TT_PROJECTS_NOTES(USR$PROJECT, USR$NOTE)
      VALUES(:project, :note)
      RETURNING ID`,
      {
        project: newProject.ID,
        note: notes[0].message
      }
    );

    // const newNotes = notes && Promise.all(notes.map(async note => {
    //   return await fetchAsSingletonObject<IProjectNote>(
    //     `INSERT INTO USR$CRM_TT_PROJECTS_NOTES(USR$PROJECT, USR$NOTE)
    //     VALUES(:project, :note)
    //     RETURNING ID`,
    //     {
    //       project: newProject.ID,
    //       note: note.message
    //     }
    //   );
    // }));

    await releaseTransaction();
    const project = await findOne(sessionID, { ID: newProject.ID });

    return project;
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

export const timeTrackerProjectsRepository = {
  find,
  findOne,
  save,
  update,
  remove
};
