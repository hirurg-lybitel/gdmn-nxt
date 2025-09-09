import { baseUrl } from './../../../../../../gdmn-nxt-web/src/app/constants/index';
import { cacheManager } from '@gdmn-nxt/cache-manager';
import { BadRequest, FindHandler, IBusinessProcess, ICustomer, ICustomerFeedback, ICustomerTickets, IFavoriteContact, ILabel, ILabelsContact, ITimeTrackTask, LessThanOrEqual, NotFoundException, RemoveOneHandler } from '@gsbelarus/util-api-types';
import { cachedRequets, ContactBusiness, ContactLabel, Customer, CustomerInfo } from '@gdmn-nxt/server/utils/cachedRequests';
import { timeTrackerTasksService } from '@gdmn-nxt/modules/time-tracker-tasks/service';
import task from '@gdmn-nxt/controllers/kanban/task';
import { contractsService } from '@gdmn-nxt/modules/contracts/service';
import { debtsRepository } from '../repository/debts';
import dayjs from '@gdmn-nxt/dayjs';
import { customerRepository } from '../repository';
import { acquireReadTransaction, commitTransaction, rollbackTransaction, startTransaction } from '@gdmn-nxt/db-connection';
import { feedbackService } from '@gdmn-nxt/modules/customer-feedback/service';
import { ticketsUserService } from '@gdmn-nxt/modules/tickets-user/service';
import { sendEmail, SmtpOptions } from '@gdmn/mailer';
import { systemSettingsRepository } from '@gdmn-nxt/repositories/settings/system';
import { config } from '@gdmn-nxt/config';

type CustomerDto = Omit<ICustomer, 'ID'>;

const find: FindHandler<ICustomer> = async (sessionID, clause = {}, order = {}) => {
  const {
    ID,
    DEPARTMENTS = '',
    CONTRACTS = '',
    WORKTYPES = '',
    LABELS = '',
    BUSINESSPROCESSES = '',
    NAME = '',
    customerId,
    isFavorite,
    userId = -1,
    withTasks,
    withAgreements,
    withDebt,
    ticketSystem,
    sortByFavorite = 'true'
  } = clause as any;

  const sortField = Object.keys(order)[0] ?? 'NAME';
  const sortMode = order[sortField] ?? 'ASC';

  const { fetchAsObject, releaseReadTransaction } = await acquireReadTransaction(sessionID);

  try {
    const labels = new Map();
    const businessProcesses = new Map();
    const customerInfo = new Map();
    const users = new Map();

    (await cacheManager.getKey<ContactLabel[]>('customerLabels'))
      ?.forEach(l => {
        if (labels[l.USR$CONTACTKEY]) {
          if (!labels[l.USR$CONTACTKEY].includes(l.ID)) {
            labels[l.USR$CONTACTKEY].push({ ...l });
          }
        } else {
          labels[l.USR$CONTACTKEY] = [{ ...l }];
        };
      });

    (await cacheManager.getKey<ContactBusiness[]>('businessProcesses'))
      ?.forEach(bp => {
        const { CONTACTKEY, ...restBusinessProc } = bp;
        if (businessProcesses[CONTACTKEY]) {
          if (!businessProcesses[CONTACTKEY].includes(restBusinessProc.ID)) {
            businessProcesses[CONTACTKEY].push({ ...restBusinessProc });
          }
        } else {
          businessProcesses[CONTACTKEY] = [{ ...restBusinessProc }];
        };
      });

    (await cacheManager.getKey<CustomerInfo[]>('customerInfo'))
      ?.forEach(ci => {
        if (customerInfo[ci.USR$CUSTOMERKEY]) {
          if (!customerInfo[ci.USR$CUSTOMERKEY].JOBS.includes(ci.USR$JOBKEY)) {
            customerInfo[ci.USR$CUSTOMERKEY].JOBS.push(ci.USR$JOBKEY);
          }
          if (!customerInfo[ci.USR$CUSTOMERKEY].DEPOTS.includes(ci.USR$DEPOTKEY)) {
            customerInfo[ci.USR$CUSTOMERKEY].DEPOTS.push(ci.USR$DEPOTKEY);
          }
          if (!customerInfo[ci.USR$CUSTOMERKEY].JOBWORKS.includes(ci.USR$JOBWORKKEY)) {
            customerInfo[ci.USR$CUSTOMERKEY].JOBWORKS.push(ci.USR$JOBWORKKEY);
          }
        } else {
          customerInfo[ci.USR$CUSTOMERKEY] = {
            JOBS: [ci.USR$JOBKEY],
            DEPOTS: [ci.USR$DEPOTKEY],
            JOBWORKS: [ci.USR$JOBWORKKEY]
          };
        };
      });

    const usersRes = await fetchAsObject<any>(
      `
        SELECT
          u.ID,
          u.NAME,
          u.FULLNAME,
          u.DISABLED,
          con.ID AS CONTACT_ID,
          con.NAME AS CONTACT_NAME
        FROM GD_USER u
        JOIN GD_CONTACT con ON con.ID = u.CONTACTKEY
        WHERE u.disabled = 0`,
    );

    usersRes.forEach((user) => {
      users[user['ID']] = user;
    });

    const tasks = new Map<number, ITimeTrackTask[]>();
    const withTasksBool = (withTasks as string)?.toLowerCase() === 'true';

    if (withTasksBool) {
      (await timeTrackerTasksService.findAll(sessionID, { userId, isActive: 'true', considerProjectStatus: 'true' }))
        ?.forEach(({ project, ...task }) => {
          const customerId = project.customer.ID;
          if (tasks.has(customerId)) {
            if (tasks.get(customerId)?.findIndex(({ ID }) => ID === task.ID) < 0) {
              tasks.get(customerId)?.push(task);
            }
          } else {
            tasks.set(customerId, [task]);
          };
        });
    }

    const favoritesMap: Record<string, number[]> = {};
    const favorites = await cacheManager.getKey<IFavoriteContact[]>('favoriteContacts') ?? [];
    favorites.forEach(f => {
      if (f.USER !== userId) {
        return;
      }
      if (favoritesMap[f.USER]) {
        favoritesMap[f.USER].push(f.CONTACT.ID);
      } else {
        favoritesMap[f.USER] = [f.CONTACT.ID];
      }
    });

    /** Действующие договоры по клиентам */
    const agreements = new Map<number, number[]>();
    const withAgreementsBool = (withAgreements as string)?.toLowerCase() === 'true';
    if (withAgreementsBool) {
      const contracts = (await contractsService.findAll(
        sessionID,
        null,
        {
          isActive: 'true'
        }))
        .contracts;

      contracts.forEach(({ ID, customer: { ID: customerId } }) => {
        if (agreements.has(customerId)) {
          agreements.get(customerId)?.push(ID);
        } else {
          agreements.set(customerId, [ID]);
        };
      });
    }

    /** Задолженности */
    const debts = new Map<number, number>();
    const withDebtBool = (withDebt as string)?.toLowerCase() === 'true';
    if (withDebtBool) {
      const debtRecords = await debtsRepository.find(
        sessionID,
        {
          entrydate: LessThanOrEqual(
            dayjs()
              .subtract(1, 'month')
              .endOf('month')
              .format('DD.MM.YYYY')),
        });

      debtRecords.forEach(({ customerId, amount }) => {
        if (debts.has(customerId)) {
          debts.set(customerId, debts.get(customerId) + amount);
        } else {
          debts.set(customerId, amount);
        }
      });
    }

    const labelIds = LABELS ? (LABELS as string).split(',').map(Number) ?? [] : [];
    const depotIds = DEPARTMENTS ? (DEPARTMENTS as string).split(',').map(Number) ?? [] : [];
    const contractIds = CONTRACTS ? (CONTRACTS as string).split(',').map(Number) ?? [] : [];
    const worktypeIds = WORKTYPES ? (WORKTYPES as string).split(',').map(Number) ?? [] : [];
    const buisnessProcessIds = BUSINESSPROCESSES ? (BUSINESSPROCESSES as string).split(',').map(Number) ?? [] : [];
    const favoriteOnly = (isFavorite as string)?.toLowerCase() === 'true';
    const sortByFavoriteEnable = sortByFavorite === 'true';

    const cachedContacts = await (async () => {
      const customers = await cacheManager.getKey<Customer[]>('customers');
      if (!customers) {
        await cachedRequets.cacheRequest('customers');
        const customers = await cacheManager.getKey<Customer[]>('customers');
        return customers ?? [];
      }
      return customers;
    })();

    const contacts = cachedContacts
      .reduce((filteredArray, c) => {
        let checkConditions = true;

        if (ticketSystem) {
          checkConditions = checkConditions && (c['TICKETSYSTEM'] === (ticketSystem === 'true' ? 1 : 0));
        }

        if (ID) {
          checkConditions = checkConditions && (c.ID === ID);
        }

        if (LABELS) {
          checkConditions = checkConditions && !!labels[c.ID]?.some(l => labelIds.includes(l.ID));
        }
        if (DEPARTMENTS) {
          checkConditions = checkConditions && !!customerInfo[c.ID]?.DEPOTS.some(d => depotIds.includes(d));
        }
        if (CONTRACTS) {
          checkConditions = checkConditions && !!customerInfo[c.ID]?.JOBS.some(j => contractIds.includes(j));
        }
        if (WORKTYPES) {
          checkConditions = checkConditions && !!customerInfo[c.ID]?.JOBWORKS.some(jw => worktypeIds.includes(jw));
        }
        if (BUSINESSPROCESSES) {
          checkConditions = checkConditions && !!businessProcesses[c.ID]?.some(bp => buisnessProcessIds.includes(bp.PROCKEY));
        }
        if (NAME) {
          checkConditions = checkConditions && (
            c.NAME?.toLowerCase().includes(String(NAME).toLowerCase()) ||
            c.TAXID?.toLowerCase().includes(String(NAME).toLowerCase())
          );
        }
        if (customerId > 0) {
          checkConditions = checkConditions && c.ID === customerId;
        }

        const isFavorite = !!favoritesMap[userId]?.some(f => f === c.ID);
        if (favoriteOnly) {
          checkConditions = checkConditions &&
            isFavorite && favoriteOnly;
        }

        if (checkConditions) {
          const customerLabels = labels[c.ID] ?? null;
          const BUSINESSPROCESSES = businessProcesses[c.ID] ?? null;

          const performerKey = c.PERFORMERKEY;

          filteredArray.push({
            ...c,
            NAME: c.NAME || '<не указано>',
            LABELS: customerLabels,
            BUSINESSPROCESSES,
            isFavorite,
            performer: users[performerKey],
            ...(withTasksBool ? {
              taskCount: tasks.get(c.ID)?.length ?? 0,
            } : {}),
            ...(withAgreementsBool ? {
              agreementCount: agreements.get(c.ID)?.length ?? 0
            } : {}),
            ...(withDebtBool ? {
              debt: debts.get(c.ID) ?? 0
            } : {})
          });
        }
        return filteredArray;
      }, [])
      .sort((a, b) => {
        const dataType = typeof (a[String(sortField)] ?? b[String(sortField)]);

        const nameA = (() => {
          const fieldValue = a[String(sortField)];
          if (dataType === 'string') {
            return fieldValue?.toLowerCase() || '';
          }
          return fieldValue;
        })();

        const nameB = (() => {
          const fieldValue = b[String(sortField)];
          if (typeof fieldValue === 'string') {
            return fieldValue?.toLowerCase() || '';
          }
          return fieldValue;
        })();

        if (a.isFavorite === b.isFavorite || !sortByFavoriteEnable) {
          if (dataType === 'string') {
            return String(sortMode).toUpperCase() === 'ASC'
              ? nameA?.localeCompare(nameB)
              : nameB?.localeCompare(nameA);
          }
          if (dataType === 'number') {
            return String(sortMode).toUpperCase() === 'ASC'
              ? nameA - nameB
              : nameB - nameA;
          }
        }

        if (sortByFavoriteEnable) {
          return a.isFavorite ? -1 : 1;
        }

        return 0;
      });

    return contacts;
  } finally {
    await releaseReadTransaction();
  }
};

const findOne = async (
  sessionID,
  id: number
): Promise<ICustomer> => {
  const customers = await find(sessionID, { ID: id });
  if (customers.length === 0) {
    return Promise.resolve(undefined);
  }
  return customers[0];
};

const createCustomer = async (
  sessionID: string,
  body: CustomerDto
) => {
  const { attachment, transaction } = await startTransaction(sessionID);
  try {
    const newCustomer = await customerRepository.save(sessionID, body);

    try {
      newCustomer.LABELS = await upsertLabels({ attachment, transaction }, newCustomer.ID, body.LABELS);
      newCustomer.BUSINESSPROCESSES = await upsertBusinessProcesses({ attachment, transaction }, newCustomer.ID, body.BUSINESSPROCESSES);
      newCustomer.feedback = await upsertFeedback(sessionID, newCustomer, body.feedback);
    } catch (error) {
      await rollbackTransaction(sessionID, transaction);
      await customerRepository.remove(sessionID, newCustomer.ID);

      throw error;
    }

    await commitTransaction(sessionID, transaction);

    return newCustomer;
  } catch (error) {
    await rollbackTransaction(sessionID, transaction);
    throw error;
  }
};

const updateCustomer = async (
  sessionID: string,
  id: number,
  body: Partial<CustomerDto>
) => {
  const { attachment, transaction } = await startTransaction(sessionID);
  try {
    const newCustomer = await customerRepository.update(sessionID, id, body);

    try {
      newCustomer.LABELS = await upsertLabels({ attachment, transaction }, newCustomer.ID, body.LABELS);
      newCustomer.BUSINESSPROCESSES = await upsertBusinessProcesses({ attachment, transaction }, newCustomer.ID, body.BUSINESSPROCESSES);
      newCustomer.feedback = await upsertFeedback(sessionID, newCustomer, body.feedback);
    } catch (error) {
      await rollbackTransaction(sessionID, transaction);

      throw error;
    }

    await commitTransaction(sessionID, transaction);

    return newCustomer;
  } catch (error) {
    throw error;
  }
};

const deleteCustomer: RemoveOneHandler = async (sessionID, id) => {
  try {
    await customerRepository.remove(sessionID, id);
    cachedRequets.cacheRequest('customers');

    return true;
  } catch (error) {
    throw error;
  }
};

const addToTickets = async (
  sessionID: string,
  body: ICustomerTickets
) => {
  try {
    if (!body?.customer?.ID) {
      throw BadRequest('Не указана организация');
    }
    const newCustomer = await customerRepository.addToTickets(sessionID, body.customer.ID, body);
    const newUser = await ticketsUserService.create(
      sessionID,
      {
        company: body.customer,
        password: body.admin.password,
        fullName: body.admin.fullName,
        userName: body.admin.name
      },
      true
    );

    const { smtpHost, smtpPort, smtpUser, smtpPassword } = await systemSettingsRepository.findOne('mailer');

    const smtpOpt: SmtpOptions = {
      host: smtpHost,
      port: smtpPort,
      user: smtpUser,
      password: smtpPassword
    };

    const messageText = `
        <div style="max-width:600px;margin:0 auto;padding:20px;font-family:Arial">
          <div style="font-size:16px;margin-bottom:24px">Добрый день!</div>
          <div style="font-size:20px;font-weight:bold;color:#1976d2">Для вас был создан аккаунт в системе заявок.</div>
          <div style="background:#f5f9ff;border:1px solid #e3f2fd;border-radius:8px;padding:16px;margin:16px 0">
            <div style="color:#666">Логин: ${body.admin.name}</div>
            <div style="color:#666">Пароль: ${body.admin.password}</div>
          </div>
          <div style="margin-top:24px;border-top:1px solid #eee;padding-top:16px">
            <a href="${config.origin}/tickets/login" style="color:#1976d2">Войти в систему заявок</a>
            <p style="color:#999;font-size:12px">Это автоматическое уведомление. Пожалуйста, не отвечайте на него.</p>
          </div>
        </div>`;

    try {
      await sendEmail({
        from: 'Система заявок',
        to: body.email,
        subject: 'Учетная запись',
        html: messageText,
        options: { ...smtpOpt }
      });
    } catch (error) {
      console.error(error);
    }

    return newCustomer;
  } catch (error) {
    throw error;
  }
};

const updateTicketsCustomer = async (
  sessionID: string,
  id: number,
  body: Partial<ICustomer>
) => {
  try {
    const newCustomer = await customerRepository.updateTickets(sessionID, id, body);

    return newCustomer;
  } catch (error) {
    throw error;
  }
};

const removeFromTickets = async (
  sessionID: string,
  id: number
) => {
  try {
    // const newCustomer = await customerRepository.updateTickets(sessionID, id, { ticketSystem: false });

    return {};
  } catch (error) {
    throw error;
  }
};


export const customersService = {
  find,
  findOne,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  addToTickets,
  removeFromTickets,
  updateTicketsCustomer
};


const upsertLabels = async (firebirdProps: any, contactId: number, labels: ILabel[]): Promise<ILabel[]> => {
  const { attachment, transaction } = firebirdProps;


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
        ID TYPE OF COLUMN USR$CRM_LABELS.ID,
        USR$COLOR TYPE OF COLUMN USR$CRM_LABELS.USR$COLOR,
        USR$DESCRIPTION TYPE OF COLUMN USR$CRM_LABELS.USR$DESCRIPTION,
        USR$ICON TYPE OF COLUMN USR$CRM_LABELS.USR$ICON,
        USR$NAME TYPE OF COLUMN USR$CRM_LABELS.USR$NAME,
        USR$CONTACTKEY TYPE OF COLUMN USR$CRM_CUSTOMER_LABELS.USR$CONTACTKEY
      )
      AS
      BEGIN
        DELETE FROM USR$CRM_CUSTOMER_LABELS WHERE USR$CONTACTKEY = :CONTACTKEY AND USR$LABELKEY = :LABELKEY ;

        INSERT INTO USR$CRM_CUSTOMER_LABELS(USR$CONTACTKEY, USR$LABELKEY)
        VALUES(:CONTACTKEY, :LABELKEY);

        SELECT ID, USR$COLOR, USR$DESCRIPTION, USR$ICON, USR$NAME
        FROM USR$CRM_LABELS
        WHERE ID = :LABELKEY
        INTO :ID, :USR$COLOR, :USR$DESCRIPTION, :USR$ICON, :USR$NAME;

        USR$CONTACTKEY = :CONTACTKEY;

        SUSPEND;
      END`;

    const records = await Promise.all(contactLabels.map(async label => {
      return (await attachment.executeReturningAsObject(transaction, insertSQL, Object.values(label)));
    }));
    cachedRequets.cacheRequest('customerLabels');

    return records as ILabel[];
  } catch (error) {
    console.error('upsertLabels', error);

    return;
  };
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

const upsertFeedback = async (
  sessionId: string,
  customer: ICustomer,
  feedback: ICustomerFeedback[]
) => {
  if (!feedback) return [];
  if (feedback.length === 0) return [];


  try {
    return await Promise.all(feedback?.map(async (f) => await feedbackService.createFeedback(sessionId, { ...f, customer })));
  } catch (error) {
    throw error;
  }
};
