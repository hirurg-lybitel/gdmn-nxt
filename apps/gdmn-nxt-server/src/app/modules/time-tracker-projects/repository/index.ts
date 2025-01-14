import { adjustRelationName } from '@gdmn-nxt/controllers/er/at-utils';
import { acquireReadTransaction, startTransaction } from '@gdmn-nxt/db-connection';
import { timeTrackerTasksService } from '@gdmn-nxt/modules/time-tracker-tasks/service';
import { FindHandler, FindOneHandler, FindOperator, IContactPerson, ITimeTrackProject, ITimeTrackTask, RemoveOneHandler, SaveHandler } from '@gsbelarus/util-api-types';
import { IProjectEmployee, projectEmployeesRepository } from './projectEmployees';
import { cacheManager } from '@gdmn-nxt/cache-manager';

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
        z.USR$DONE,
        z.USR$CREATOR,
        z.USR$NOTE,
        type.ID PROJECT_TYPE_ID,
        type.USR$PARENT PROJECT_TYPE_PARENT,
        type.USR$NAME PROJECT_TYPE_NAME
      FROM USR$CRM_TIMETRACKER_PROJECTS z
      JOIN GD_CONTACT con ON con.ID = z.USR$CUSTOMER
      LEFT JOIN USR$CRM_TT_PROJECT_TYPE type ON type.ID = z.USR$PROJECT_TYPE
      ${clauseString.length > 0 ? ` WHERE ${clauseString}` : ''}
      ${order ? ` ORDER BY z.${Object.keys(order)[0]} ${Object.values(order)[0]}` : ''}`,
      { ...whereClause });

    const employees = await projectEmployeesRepository.find(sessionID);
    const cachedPersons = await cacheManager.getKey<IContactPerson[]>('customerPersons') ?? [];

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
      note: r['USR$NOTE'],
      projectType: {
        ID: r['PROJECT_TYPE_ID'],
        name: r['PROJECT_TYPE_NAME'],
        parent: r['PROJECT_TYPE_PARENT']
      },
      creator: cachedPersons.find(person => person.ID === r['USR$CREATOR'])
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

const update = async (
  sessionID: string,
  userId: number,
  id: number,
  metadata: Partial<ITimeTrackProject>
): Promise<ITimeTrackProject> => {
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
      note = project.note,
      projectType = project.projectType,
    } = metadata;

    const oldEmployees: IProjectEmployee[] = ((await projectEmployeesRepository.find(sessionID, true))[`${id}`]) as IProjectEmployee[];

    if (JSON.stringify(employees) !== JSON.stringify(project.employees)) {
      // delete old employees
      oldEmployees && await Promise.all(oldEmployees?.map(async empl => {
        return await projectEmployeesRepository.remove(sessionID, empl.ID);
      }));
      // add new employees
      employees && await Promise.all(employees?.map(async empl => {
        return await projectEmployeesRepository.save(sessionID, empl.ID, id);
      }));
    };

    const oldTasks = (await timeTrackerTasksService.findAll(sessionID, { projectId: id, userId })).map(task => ({ ...task, project: undefined }));

    if (JSON.stringify(tasks) !== JSON.stringify(oldTasks)) {
      // find and delete tasks
      await Promise.all(oldTasks?.map(async oldTask => {
        const taskForDelete = tasks?.find(task => oldTask.ID === task.ID);
        if (!taskForDelete) {
          timeTrackerTasksService.remove(sessionID, oldTask.ID);
        }
      }));

      // check all tasks and update or add
      tasks?.map(async task => {
        const oldTask = oldTasks.find(({ ID }) => ID === task.ID);
        if (!oldTask) {
          const newTask = await timeTrackerTasksService.create(sessionID, userId, { ...task, project: project });
          return newTask;
        };
        if (JSON.stringify(task) !== JSON.stringify(oldTask)) {
          const newTask = await timeTrackerTasksService.update(sessionID, task.ID, userId, { ...task, project: project });
          return newTask;
        };
      });
    }

    const updatedPoject = await fetchAsSingletonObject<ITimeTrackProject>(
      `UPDATE USR$CRM_TIMETRACKER_PROJECTS z
      SET
        z.USR$NAME = :name,
        z.USR$DONE = :isDone,
        z.USR$PRIVATE = :isPrivate,
        z.USR$CUSTOMER = :customer,
        z.USR$PROJECT_TYPE = :projectType,
        z.USR$NOTE = :note
      WHERE
        ID = :id
      RETURNING ID`,
      {
        id,
        name: name,
        isDone: isDone,
        isPrivate: isPrivate,
        customer: customer.ID,
        projectType: projectType.ID,
        note: note
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
    note,
    projectType,
    creator
  } = metadata;

  try {
    const newProject = await fetchAsSingletonObject<ITimeTrackProject>(
      `INSERT INTO USR$CRM_TIMETRACKER_PROJECTS(USR$NAME, USR$CUSTOMER, USR$DONE, USR$PRIVATE, USR$PROJECT_TYPE, USR$CREATOR, USR$NOTE)
      VALUES(:name, :customer, :isDone, :isPrivate, :projectType, :creator, :note)
      RETURNING ID`,
      {
        name,
        customer: customer.ID,
        isDone,
        isPrivate,
        projectType: projectType.ID,
        creator: creator.ID,
        note
      }
    );

    const newTasks = tasks && await Promise.all(tasks.map(async (task) => {
      const newTask = await fetchAsSingletonObject<ITimeTrackTask>(
        `INSERT INTO USR$CRM_TIMETRACKER_TASKS(USR$NAME, USR$PROJECT, USR$ISACTIVE)
            VALUES(:name, :project, :isActive)
            RETURNING ID`,
        {
          name: task.name,
          project: newProject.ID,
          isActive: task.isActive
        }
      );
      return { ...task, ID: newTask.ID };
    }));

    const newEmployees = employees && await Promise.all(employees.map(async empl => {
      const newEmpl = await fetchAsSingletonObject<IContactPerson>(
        `INSERT INTO USR$CRM_TT_PROJECTS_EMPLOYEES(USR$PROJECT, USR$CONTACTKEY)
        VALUES(:projectId, :contactKey)
        RETURNING ID`,
        {
          projectId: newProject.ID,
          contactKey: empl.ID
        }
      );
      return newEmpl;
    }));

    await releaseTransaction();
    const project = await findOne(sessionID, { ID: newProject.ID });

    return { ...project, tasks: newTasks };
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
    releaseTransaction
  } = await startTransaction(sessionID);

  try {
    const employees: IProjectEmployee[] = ((await projectEmployeesRepository.find(sessionID, true))[`${id}`]) as IProjectEmployee[];
    const tasks = (await timeTrackerTasksService.findAll(sessionID, { projectId: id }));

    employees && await Promise.all(employees?.map(async empl => {
      return await projectEmployeesRepository.remove(sessionID, empl.ID);
    }));

    tasks && await Promise.all(tasks?.map(async task => {
      return await timeTrackerTasksService.remove(sessionID, task.ID);
    }));

    const deletedEntity = await fetchAsSingletonObject<{ID: number}>(
      `DELETE FROM USR$CRM_TIMETRACKER_PROJECTS WHERE ID = :id
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
