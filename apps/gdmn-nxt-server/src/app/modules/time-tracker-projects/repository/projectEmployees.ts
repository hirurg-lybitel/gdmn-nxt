import { cacheManager } from '@gdmn-nxt/cache-manager';
import { acquireReadTransaction, startTransaction } from '@gdmn-nxt/db-connection';
import { cachedRequets } from '@gdmn-nxt/server/utils/cachedRequests';
import { IContactPerson, IWithID } from '@gsbelarus/util-api-types';

export interface IProjectEmployee extends IWithID {
  person: IContactPerson
}

type IFindReturn = IContactPerson | IProjectEmployee

const find = async (sessionID: string, withId = false): Promise<{ [key: string]: IFindReturn[]}> => {
  const {
    fetchAsObject,
    releaseReadTransaction,
  } = await acquireReadTransaction(sessionID);

  try {
    const employees: {
    [key: string]: IFindReturn[];
  } = {};

    const rawEmployees = await fetchAsObject(
      `SELECT
      ID,
      USR$CONTACTKEY,
      USR$PROJECT
    FROM USR$CRM_TT_PROJECTS_EMPLOYEES`);

    await cachedRequets.cacheRequest('customerPersons');
    const cachedPersons = await cacheManager.getKey<IContactPerson[]>('customerPersons') ?? [];

    rawEmployees.forEach(el => {
      const person = cachedPersons.find(person => Number(person.ID) === Number(el['USR$CONTACTKEY']));
      const empl = withId ? { ID: el['ID'], person } as IProjectEmployee : person;
      if (employees[el['USR$PROJECT']]) {
        employees[el['USR$PROJECT']].push(empl);
      } else {
        employees[el['USR$PROJECT']] = [empl];
      };
    });
    return employees;
  } finally {
    releaseReadTransaction();
  }
};

const save = async(sessionID: string, contactKey: number, projectId: number) => {
  const {
    fetchAsSingletonObject,
    releaseTransaction,
  } = await startTransaction(sessionID);
  try {
    const newEmpl = await fetchAsSingletonObject<IContactPerson>(
      `INSERT INTO USR$CRM_TT_PROJECTS_EMPLOYEES(USR$PROJECT, USR$CONTACTKEY)
      VALUES(:projectId, :contactKey)
      RETURNING ID`,
      {
        projectId,
        contactKey
      }
    );
    return newEmpl;
  } finally {
    releaseTransaction();
  }
};

const remove = async (sessionID: string, id: number) => {
  const {
    fetchAsSingletonObject,
    releaseTransaction,
  } = await startTransaction(sessionID);
  try {
    const deletedEmpls = await fetchAsSingletonObject<{ID: number}>(
      `DELETE FROM USR$CRM_TT_PROJECTS_EMPLOYEES WHERE ID = :id
      RETURNING ID`,
      { id }
    );
    return deletedEmpls;
  } finally {
    releaseTransaction();
  }
};

export const projectEmployeesRepository = {
  find,
  save,
  remove
};
