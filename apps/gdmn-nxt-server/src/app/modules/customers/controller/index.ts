import { IBusinessProcess, IContactPerson, IRequestResult, SortMode } from '@gsbelarus/util-api-types';
import { RequestHandler } from 'express';
import { getReadTransaction, releaseReadTransaction } from '@gdmn-nxt/db-connection';
import { cacheManager } from '@gdmn-nxt/cache-manager';
import { CustomerInfo, CustomerPerson, Phone, cachedRequets } from '../../../utils/cachedRequests';
import { resultError } from '@gsbelarus/util-helpers';
import { customersService } from '../service';

export const getContacts: RequestHandler = async (req, res) => {
  const customerId = parseInt(req.params.customerId);
  const userId = req.user['id'];

  const { pageSize, pageNo } = req.query;
  const {
    DEPARTMENTS,
    CONTRACTS,
    WORKTYPES,
    LABELS,
    BUSINESSPROCESSES,
    NAME,
    isFavorite,
    withTasks,
    withAgreements,
    withDebt
  } = req.query;

  const sortField = (req.query.field ?? 'NAME') as string;
  const sortMode = (req.query.sort ?? 'ASC') as SortMode;

  const _schema = {};

  let fromRecord = 0;
  let toRecord: number;

  if (pageNo && pageSize) {
    fromRecord = Number(pageNo) * Number(pageSize);
    toRecord = fromRecord + Number(pageSize);
  };

  try {
    const contacts = await customersService.find(
      req.sessionID,
      {
        DEPARTMENTS, CONTRACTS, WORKTYPES, LABELS, BUSINESSPROCESSES, NAME,
        customerId, isFavorite, userId, withTasks, withAgreements, withDebt
      },
      {
        [sortField]: sortMode
      }
    );

    const rowCount = contacts.length;
    const contactsWithPagination = contacts.slice(fromRecord, toRecord);

    const result: IRequestResult = {
      queries: {
        contacts: contactsWithPagination,
        rowCount
      },
      _schema
    };

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).send(resultError(error.message));
  }
};

export const createContact: RequestHandler = async (req, res) => {
  try {
    const newCustomer = await customersService.createCustomer(req.sessionID, req.body);

    cachedRequets.cacheRequest('customers');

    const result = {
      queries: { contact: newCustomer },
      _schema: {}
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error('[ create customer ]', error);
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

export const updateContact: RequestHandler = async (req, res) => {
  const { id } = req.params;

  if (id && !parseInt(id)) {
    return res.status(422).send(resultError('Field ID is not defined or is not numeric'));
  };

  try {
    const newCustomer = await customersService.updateCustomer(req.sessionID, parseInt(id), req.body);

    cachedRequets.cacheRequest('customers');

    const result = {
      queries: { contact: newCustomer },
      _schema: {}
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error('[ update customer ]', error);
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

export const deleteContact: RequestHandler = async (req, res) => {
  const { id } = req.params;
  if (id && !parseInt(id)) {
    return res.status(422).send(resultError('Field ID is not defined or is not numeric'));
  };

  try {
    await customersService.deleteCustomer(req.sessionID, parseInt(id));
    cachedRequets.cacheRequest('customers');

    return res.status(200).send(id);
  } catch (error) {
    console.error('[ delete customer ]', error);
    return res.status(500).send(resultError(error.message));
  }
};

export const getContactHierarchy: RequestHandler = async (req, res) => {
  const { attachment, transaction } = await getReadTransaction(req.sessionID);
  try {
    const _schema = { };

    const execQuery = async ({ name, query, params }: { name: string, query: string, params?: any[] }) => {
      const rs = await attachment.executeQuery(transaction, query, params);
      try {
        const data = await rs.fetchAsObject();
        const sch = _schema[name];

        return [name, data];
      } finally {
        await rs.close();
      }
    };

    const queries = [
      {
        name: 'hierarchy',
        query: `
          SELECT
            z.ID,
            z.LB,
            z.RB,
            z.NAME
          FROM
            GD_CONTACT z
          WHERE
            Z.CONTACTTYPE  =  0`
      },
    ];

    const result: IRequestResult = {
      queries: {
        ...Object.fromEntries(await Promise.all(queries.map(q => execQuery(q))))
      },
      _schema
    };

    return res.json(result);
  } finally {
    await releaseReadTransaction(req.sessionID);
  }
};

export const getCustomersCross: RequestHandler = async (req, res) => {
  try {
    const _schema = {};

    const jobWorks = new Map();
    const contracts = new Map();
    const departments = new Map();
    const persons = new Map();
    const phones = new Map();

    const rawCustomers = (await cacheManager.getKey<CustomerInfo[]>('customerInfo')) ?? [];
    const rawPhones = (await cacheManager.getKey<Phone[]>('phones')) ?? [];
    const rawPersons = (await cacheManager.getKey<CustomerPerson[]>('customerPersons')) ?? [];

    rawCustomers.forEach(c => {
      if (c.USR$JOBKEY) {
        if (contracts[c.USR$CUSTOMERKEY]) {
          if (!contracts[c.USR$CUSTOMERKEY].includes(c.USR$JOBKEY)) {
            contracts[c.USR$CUSTOMERKEY].push(c.USR$JOBKEY);
          }
        } else {
          contracts[c.USR$CUSTOMERKEY] = [c.USR$JOBKEY];
        };
      };

      if (c.USR$JOBWORKKEY) {
        if (jobWorks[c.USR$CUSTOMERKEY]) {
          if (!jobWorks[c.USR$CUSTOMERKEY].includes(c.USR$JOBWORKKEY)) {
            jobWorks[c.USR$CUSTOMERKEY].push(c.USR$JOBWORKKEY);
          }
        } else {
          jobWorks[c.USR$CUSTOMERKEY] = [c.USR$JOBWORKKEY];
        };
      };

      if (c.USR$DEPOTKEY) {
        if (departments[c.USR$CUSTOMERKEY]) {
          if (!departments[c.USR$CUSTOMERKEY].includes(c.USR$DEPOTKEY)) {
            departments[c.USR$CUSTOMERKEY].push(c.USR$DEPOTKEY);
          }
        } else {
          departments[c.USR$CUSTOMERKEY] = [c.USR$DEPOTKEY];
        };
      }
    });

    rawPhones.forEach(p => {
      const newPhone = {
        ID: p.ID,
        USR$PHONENUMBER: p.USR$PHONENUMBER
      };

      if (phones[p.USR$CONTACTKEY]) {
        phones[p.USR$CONTACTKEY].push(newPhone);
      } else {
        phones[p.USR$CONTACTKEY] = [newPhone];
      }
    });

    rawPersons.forEach(p => {
      const newPerson: IContactPerson = {
        ID: p.ID,
        NAME: p.NAME,
        EMAIL: p.EMAIL,
        RANK: p.RANK,
        PHONES: phones[p.ID] || []
      };

      if (persons[p.PARENT]) {
        persons[p.PARENT].push(newPerson);
      } else {
        persons[p.PARENT] = [newPerson];
      };
    });
    const result: IRequestResult = {
      queries: {
        cross: [{
          departments,
          contracts,
          jobWorks,
          persons,
        }]
      },
      _schema
    };

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).send(resultError(error.message));
  }
};

const upsertBusinessProcesses = async (firebirdPropsL: any, contactId: number, businessProcesses: IBusinessProcess[]) => {
  const { attachment, transaction } = firebirdPropsL;

  if (!businessProcesses || businessProcesses?.length === 0) {
    try {
      const sql = `
        DELETE FROM USR$CROSS1242_1980093301
        WHERE USR$GD_CONTACTKEY = ?` ;

      await attachment.execute(transaction, sql, [contactId]);
      cachedRequets.cacheRequest('businessProcesses');
    } catch (error) {
      console.error('upsertBusinessProcesses', error);
    }
    return [];
  };

  try {
    const params = businessProcesses.map(bp => ({ contactId, businessProcessId: bp.ID }));

    const sql = `
      EXECUTE BLOCK(
        contactId INTEGER = ?,
        businessProcessId INTEGER = ?
      )
      RETURNS(
        ID INTEGER
      )
      AS
      BEGIN
        DELETE FROM USR$CROSS1242_1980093301
        WHERE USR$GD_CONTACTKEY = :contactId AND USR$BG_BISNESS_PROCKEY = :businessProcessId ;

        UPDATE OR INSERT INTO USR$CROSS1242_1980093301(USR$GD_CONTACTKEY, USR$BG_BISNESS_PROCKEY)
        VALUES(:contactId, :businessProcessId)
        MATCHING(USR$GD_CONTACTKEY, USR$BG_BISNESS_PROCKEY)
        RETURNING USR$BG_BISNESS_PROCKEY INTO :ID;

        SUSPEND;
      END`;

    const records: IBusinessProcess[] = await Promise.all(params.map(async bp => {
      return (await attachment.executeReturningAsObject(transaction, sql, Object.values(bp)));
    }));
    cachedRequets.cacheRequest('businessProcesses');

    return records;
  } catch (error) {
    console.error('upsertBusinessProcesses', error);
  };
};

export const customerController = {
  upsertBusinessProcesses,
  getCustomersCross,
  getContactHierarchy,
  deleteContact,
  getContacts,
  createContact,
  updateContact
};
