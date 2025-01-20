import { adjustRelationName } from '@gdmn-nxt/controllers/er/at-utils';
import { acquireReadTransaction, startTransaction } from '@gdmn-nxt/db-connection';
import { FindHandler, FindOneHandler, FindOperator, ITimeTrackTask, RemoveOneHandler, SaveHandler, UpdateHandler } from '@gsbelarus/util-api-types';
import { favoriteTimeTrackerTasksRepository } from './favoriteTimeTrackerTasks';

const find: FindHandler<ITimeTrackTask> = async (
  sessionID,
  clause
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
        return ` ${f.includes('.') ? '' : 'z.'}${f} = :${adjustRelationName(f)}`;
      })
      .join(' AND ');

    const rows = await fetchAsObject(
      `SELECT
        z.ID,
        z.USR$NAME NAME,
        z.USR$PROJECT PROJECT_ID,
        z.USR$ISACTIVE ISACTIVE,
        p.USR$NAME PROJECT_NAME,
        p.USR$DONE,
        con.ID CONTACT_ID,
        con.NAME CONTACT_NAME
      FROM USR$CRM_TIMETRACKER_TASKS z
      JOIN USR$CRM_TIMETRACKER_PROJECTS p ON p.ID = z.USR$PROJECT
      JOIN GD_CONTACT con ON con.ID = p.USR$CUSTOMER
      ${clauseString.length > 0 ? ` WHERE ${clauseString}` : ''}
      ORDER BY z.USR$NAME`,
      { ...whereClause });

    const timeTracker = await fetchAsObject(
      `SELECT
        task.ID
      FROM USR$CRM_TIMETRACKER z
      JOIN USR$CRM_TIMETRACKER_TASKS task ON task.ID = z.USR$TASK
      `
    );

    const tasks: ITimeTrackTask[] = rows.map(r => ({
      ID: r['ID'],
      name: r['NAME'],
      isActive: r['ISACTIVE'] === 1,
      project: {
        ID: r['PROJECT_ID'],
        name: r['PROJECT_NAME'],
        customer: {
          ID: r['CONTACT_ID'],
          NAME: r['CONTACT_NAME'],
        }
      },
      inUse: timeTracker.findIndex(tt => tt['ID'] === r['ID']) !== -1
    }));

    return tasks;
  } finally {
    releaseReadTransaction();
  }
};

const findOne: FindOneHandler<ITimeTrackTask> = async (
  sessionID,
  clause = {}
) => {
  const rows = await find(sessionID, clause);

  if (rows.length === 0) {
    return Promise.resolve(undefined);
  }

  return rows[0];
};

const update: UpdateHandler<ITimeTrackTask> = async (
  sessionID,
  id,
  metadata
) => {
  const {
    fetchAsSingletonObject,
    releaseTransaction,
  } = await startTransaction(sessionID);

  try {
    const timeTrack = await findOne(sessionID, { id });

    const {
      name = timeTrack.name,
      project = timeTrack.project,
      isActive = timeTrack.isActive
    } = metadata;

    const updatedTimeTrack = await fetchAsSingletonObject<ITimeTrackTask>(
      `UPDATE USR$CRM_TIMETRACKER_TASKS t
      SET
        t.USR$NAME = :name,
        t.USR$PROJECT = :project,
        t.USR$ISACTIVE = :isActive
      WHERE
        ID = :id
      RETURNING ID`,
      {
        id,
        name: name,
        project: project.ID,
        isActive: isActive
      }
    );
    await releaseTransaction();

    return updatedTimeTrack;
  } catch (error) {
    await releaseTransaction(false);
    throw new Error(error);
  }
};

const save: SaveHandler<ITimeTrackTask> = async (
  sessionID,
  metadata
) => {
  const {
    fetchAsSingletonObject,
    releaseTransaction,
  } = await startTransaction(sessionID);

  const {
    name,
    project,
    isActive = true,
    isFavorite = false
  } = metadata;

  try {
    const newTask = await fetchAsSingletonObject<ITimeTrackTask>(
      `INSERT INTO USR$CRM_TIMETRACKER_TASKS(USR$NAME, USR$PROJECT, USR$ISACTIVE)
      VALUES(:name, :project, :isActive)
      RETURNING ID`,
      {
        name: name,
        project: project.ID,
        isActive: isActive
      }
    );

    await releaseTransaction();
    const task = await findOne(sessionID, { ID: newTask.ID });

    return { ...task, isFavorite };
  } catch (error) {
    await releaseTransaction(false);
    throw new Error(error);
  }
};


const remove: RemoveOneHandler = async (
  sessionID,
  id
) => {
  const {
    fetchAsSingletonObject,
    releaseTransaction,
    executeQuery
  } = await startTransaction(sessionID);

  try {
    const deletedTaskFromFavorite = await executeQuery(
      `DELETE FROM USR$CRM_TIMET_TASKS_FAVORITE
      WHERE USR$TASK = :TASK_ID`,
      {
        TASK_ID: id
      }
    );

    const deletedEntity = await fetchAsSingletonObject<{ID: number}>(
      `DELETE FROM USR$CRM_TIMETRACKER_TASKS WHERE ID = :id
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

export const timeTrackerTasksRepository = {
  find,
  findOne,
  update,
  save,
  remove
};
