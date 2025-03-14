import { IBusinessProcess, IContactPerson, IDataSchema, ILabelsContact, IRequestResult, SortMode } from '@gsbelarus/util-api-types';
import { RequestHandler } from 'express';
import { genId, getReadTransaction, releaseReadTransaction, releaseTransaction, startTransaction } from '@gdmn-nxt/db-connection';
import { cacheManager } from '@gdmn-nxt/cache-manager';
import { ContactBusiness, ContactLabel, Customer, CustomerInfo, CustomerPerson, Phone, cachedRequets } from '../../../utils/cachedRequests';
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

export const upsertContact: RequestHandler = async (req, res) => {
  const { id } = req.params;

  if (id && !parseInt(id)) return res.status(422).send(resultError('Field ID is not defined or is not numeric'));

  const { NAME, PHONE, EMAIL, ADDRESS, TAXID, LABELS, BUSINESSPROCESSES } = req.body;
  const { attachment, transaction } = await startTransaction(req.sessionID);

  try {
    let ID = parseInt(id);
    if (!ID) {
      ID = await genId(attachment, transaction);
    };

    const _schema = {};

    const execQuery = async ({ name, query, params }: { name: string, query: string, params?: any[] }) => {
      const data = await attachment.executeSingletonAsObject(transaction, query, params);

      data['LABELS'] = await upsertLabels({ attachment, transaction }, data['ID'], LABELS);
      data['BUSINESSPROCESSES'] = await upsertBusinessProcesses({ attachment, transaction }, data['ID'], BUSINESSPROCESSES);

      return [name, data];
    };

    const query = {
      name: 'contact',
      query: `
        EXECUTE BLOCK(
          in_ID  TYPE OF COLUMN GD_CONTACT.ID = ?,
          in_NAME  TYPE OF COLUMN GD_CONTACT.NAME = ?,
          in_EMAIL TYPE OF COLUMN GD_CONTACT.EMAIL = ?,
          in_PHONE TYPE OF COLUMN GD_CONTACT.PHONE = ?,
          in_ADDRESS TYPE OF COLUMN GD_CONTACT.ADDRESS = ?,
          in_TAXID TYPE OF COLUMN GD_COMPANYCODE.TAXID = ?
        )
        RETURNS(
          ID    INTEGER,
          NAME  TYPE OF COLUMN GD_CONTACT.NAME,
          EMAIL TYPE OF COLUMN GD_CONTACT.EMAIL,
          PHONE TYPE OF COLUMN GD_CONTACT.PHONE,
          ADDRESS TYPE OF COLUMN GD_CONTACT.ADDRESS,
          AXID TYPE OF COLUMN GD_COMPANYCODE.TAXID
        )
        AS
        BEGIN
          UPDATE OR INSERT INTO GD_CONTACT(ID, CONTACTTYPE, PARENT, NAME, PHONE, EMAIL, ADDRESS)
          VALUES(:in_ID, 3, (SELECT ID FROM GD_RUID WHERE XID = 147002208 AND DBID = 31587988 ROWS 1), :in_NAME, :in_PHONE, :in_EMAIL, :in_ADDRESS)
          MATCHING(ID)
          RETURNING ID, NAME, PHONE, EMAIL, ADDRESS
          INTO :ID, :NAME, :PHONE, :EMAIL, :ADDRESS;

          IF (ID IS NOT NULL) THEN
            UPDATE OR INSERT INTO GD_COMPANY(CONTACTKEY)
            VALUES(:ID)
            MATCHING(CONTACTKEY);
          IF (ID IS NOT NULL) THEN
            UPDATE OR INSERT INTO GD_COMPANYCODE(COMPANYKEY, TAXID)
            VALUES(:ID, :in_TAXID)
            MATCHING(COMPANYKEY)
            RETURNING TAXID
            INTO :in_TAXID;
          SUSPEND;
        END`,
      params: [ID, NAME, EMAIL, PHONE, ADDRESS, TAXID],
    };


    const row = await Promise.resolve(execQuery(query));

    cachedRequets.cacheRequest('customers');

    const result: IRequestResult = {
      queries: {
        ...Object.fromEntries([row])
      },
      _schema
    };

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).send(resultError(error.message));
  } finally {
    await releaseTransaction(req.sessionID, transaction);
  };
};

export const deleteContact: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const { attachment, transaction, releaseTransaction } = await startTransaction(req.sessionID);

  try {
    await attachment.execute(
      transaction,
      `EXECUTE BLOCK(
        ID INTEGER = ?
      )
      AS
      BEGIN
        DELETE FROM GD_COMPANYCODE WHERE COMPANYKEY = :ID;
        DELETE FROM GD_COMPANY WHERE CONTACTKEY = :ID;
        DELETE FROM GD_CONTACT WHERE ID = :ID;
      END`,
      [id]
    );

    cachedRequets.cacheRequest('customers');

    return res.status(200).send(id);
  } catch (error) {
    return res.status(500).send(resultError(error.message));
  } finally {
    await releaseTransaction();
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

const upsertLabels = async(firebirdPropsL: any, contactId: number, labels: ILabelsContact[]): Promise<ILabelsContact[]> => {
  const { attachment, transaction } = firebirdPropsL;

  if (!labels || labels?.length === 0) {
    try {
      const sql = `
        DELETE FROM USR$CRM_CUSTOMER_LABELS
        WHERE USR$CONTACTKEY = ?` ;

      await attachment.execute(transaction, sql, [contactId]);
      cachedRequets.cacheRequest('customerLabels');
    } catch (error) {
      console.error('upsertLabels', error);
    }
    return [];
  };

  const contactLabels = labels.map(label => ({ CONTACT: contactId, LABELKEY: label.ID }));

  try {
    /** Поскольку мы передаём весь массив лейблов, то удалим все прежние  */
    const deleteSQL = 'DELETE FROM USR$CRM_CUSTOMER_LABELS WHERE USR$CONTACTKEY = ?';

    await Promise.all(
      [...new Set(contactLabels.map(el => el.CONTACT))]
        .map(async contact => {
          await attachment.execute(transaction, deleteSQL, [contact]);
        })
    );

    const insertSQL = `
      EXECUTE BLOCK(
        CONTACTKEY TYPE OF COLUMN USR$CRM_CUSTOMER_LABELS.USR$CONTACTKEY = ?,
        LABELKEY TYPE OF COLUMN USR$CRM_CUSTOMER_LABELS.USR$LABELKEY = ?
      )
      RETURNS(
        ID TYPE OF COLUMN USR$CRM_LABELS.ID
      )
      AS
      BEGIN
        DELETE FROM USR$CRM_CUSTOMER_LABELS WHERE USR$CONTACTKEY = :CONTACTKEY AND USR$LABELKEY = :LABELKEY ;

        INSERT INTO USR$CRM_CUSTOMER_LABELS(USR$CONTACTKEY, USR$LABELKEY)
        VALUES(:CONTACTKEY, :LABELKEY);

        SELECT ID
        FROM USR$CRM_LABELS
        WHERE ID = :LABELKEY
        INTO :ID;

        SUSPEND;
      END`;

    const records = await Promise.all(contactLabels.map(async label => {
      return (await attachment.executeReturningAsObject(transaction, insertSQL, Object.values(label)));
    }));
    cachedRequets.cacheRequest('customerLabels');

    return records as ILabelsContact[];
  } catch (error) {
    console.error('upsertLabels', error);

    return;
  };
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
  upsertLabels,
  getContactHierarchy,
  deleteContact,
  upsertContact,
  getContacts
};
