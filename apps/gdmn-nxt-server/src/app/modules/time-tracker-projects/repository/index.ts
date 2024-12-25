import { cacheManager } from '@gdmn-nxt/cache-manager';
import { adjustRelationName } from '@gdmn-nxt/controllers/er/at-utils';
import { acquireReadTransaction, startTransaction } from '@gdmn-nxt/db-connection';
import { timeTrackerTasksService } from '@gdmn-nxt/modules/time-tracker-tasks/service';
import { cachedRequets } from '@gdmn-nxt/server/utils/cachedRequests';
import { FindHandler, FindOneHandler, FindOperator, IContactPerson, IProjectNote, ITimeTrackProject, RemoveHandler, SaveHandler, UpdateHandler } from '@gsbelarus/util-api-types';
import { projectNotesRepository } from './projectNotes';
import { IProjectEmployee, projectEmployeesRepository } from './projectEmployees';

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
        con.NAME CUSTOMER_NAME,
        z.USR$PRIVATE,
        z.USR$DONE
      FROM USR$CRM_TIMETRACKER_PROJECTS z
      JOIN GD_CONTACT con ON con.ID = z.USR$CUSTOMER
      ${clauseString.length > 0 ? ` WHERE ${clauseString}` : ''}
      ${order ? ` ORDER BY z.${Object.keys(order)[0]} ${Object.values(order)[0]}` : ''}`,
      { ...whereClause });

    const notes = await projectNotesRepository.find(sessionID);
    const employees = await projectEmployeesRepository.find(sessionID);

    const projects: ITimeTrackProject[] = rows.map(r => ({
      ID: r['ID'],
      name: r['NAME'],
      customer: {
        ID: r['CUSTOMER_ID'],
        NAME: r['CUSTOMER_NAME']
      },
      isPrivate: r['USR$PRIVATE'] === 1,
      isDone: r['USR$DONE'] === 1,
      employees: employees[r['ID']] as IContactPerson[],
      notes: notes[r['ID']]
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
  } = await startTransaction(sessionID);

  try {
    const project = await findOne(sessionID, { ID: id });

    const {
      name = project.name,
      customer = project.customer,
      isDone = project.isDone,
      isPrivate = project.isPrivate,
      tasks = project.tasks,
      employees = project.employees,
      notes = project.notes,
    } = metadata;


    const oldNotes = project.notes;
    const oldEmployees: IProjectEmployee[] = ((await projectEmployeesRepository.find(sessionID, true))[`${id}`]) as IProjectEmployee[];

    if (JSON.stringify(notes) !== JSON.stringify(oldNotes)) {
      // delete old notes
      oldNotes && await Promise.all(oldNotes?.map(async note => {
        return await projectNotesRepository.remove(sessionID, note.ID);
      }));
      // add new notes
      notes && await Promise.all(notes?.map(async note => {
        return await projectNotesRepository.save(sessionID, note, id);
      }));
    };

    if (JSON.stringify(employees) !== JSON.stringify(oldEmployees)) {
      // delete old employees
      oldEmployees && await Promise.all(oldEmployees?.map(async empl => {
        return await projectEmployeesRepository.remove(sessionID, empl.ID);
      }));
      // add new employees
      employees && await Promise.all(employees?.map(async empl => {
        return await projectEmployeesRepository.save(sessionID, empl.ID, id);
      }));
    };

    const oldTasks = await timeTrackerTasksService.findAll(sessionID, { projectId: id });

    await Promise.all(oldTasks?.map(async oldTask => {
      const taskForDelete = tasks?.find(task => oldTask.ID === task.ID);
      if (!taskForDelete) {
        timeTrackerTasksService.remove(sessionID, oldTask.ID);
      }
    }));

    tasks?.map(async task => {
      const oldTask = oldTasks.find(({ ID }) => ID === task.ID);
      if (!oldTask) {
        return await timeTrackerTasksService.create(sessionID, { ...task, project: project });
      };

      if (JSON.stringify(task) !== JSON.stringify(oldTask)) {
        return await timeTrackerTasksService.update(sessionID, task.ID, { ...task, project: project });
      };
    });

    const updatedPoject = await fetchAsSingletonObject<ITimeTrackProject>(
      `UPDATE USR$CRM_TIMETRACKER_PROJECTS z
      SET
        z.USR$NAME = :name,
        z.USR$DONE = :isDone,
        z.USR$PRIVATE = :isPrivate,
        z.USR$CUSTOMER = :customer
      WHERE
        ID = :id
      RETURNING ID`,
      {
        id,
        name: name,
        isDone: isDone,
        isPrivate: isPrivate,
        customer: customer.ID,
      }
    );

    await releaseTransaction();

    const newProject = await findOne(sessionID, { ID: updatedPoject.ID });

    return newProject;
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

    const newTasks = tasks && await Promise.all(tasks.map(async task => {
      return await timeTrackerTasksService.create(sessionID, { ...task, project: newProject });
    }));

    const newEmployees = employees && await Promise.all(employees.map(async empl => {
      return projectEmployeesRepository.save(sessionID, empl.ID, newProject.ID);
    }));

    const newNotes = notes && await Promise.all(notes.map(async note => {
      return await fetchAsSingletonObject<IProjectNote>(
        `INSERT INTO USR$CRM_TT_PROJECTS_NOTES(USR$PROJECT, USR$NOTE)
        VALUES(:project, :note)
        RETURNING ID`,
        {
          project: newProject.ID,
          note: note.message
        }
      );
    }));

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
