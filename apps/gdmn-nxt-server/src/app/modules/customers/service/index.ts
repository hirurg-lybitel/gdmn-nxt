import { cacheManager } from '@gdmn-nxt/cache-manager';
import { FindHandler, ICustomer } from '@gsbelarus/util-api-types';
import { ContactBusiness, ContactLabel, Customer, CustomerInfo } from '@gdmn-nxt/server/utils/cachedRequests';

const find: FindHandler<ICustomer> = async (sessionID, clause = {}) => {
  const {
    ID,
    DEPARTMENTS = '',
    CONTRACTS = '',
    WORKTYPES = '',
    LABELS = '',
    BUSINESSPROCESSES = '',
    NAME = ''
  } = clause as any;

  try {
    const labels = new Map();
    const businessProcesses = new Map();
    const customerInfo = new Map();

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

    const labelIds = LABELS ? (LABELS as string).split(',').map(Number) ?? [] : [];
    const depotIds = DEPARTMENTS ? (DEPARTMENTS as string).split(',').map(Number) ?? [] : [];
    const contractIds = CONTRACTS ? (CONTRACTS as string).split(',').map(Number) ?? [] : [];
    const worktypeIds = WORKTYPES ? (WORKTYPES as string).split(',').map(Number) ?? [] : [];
    const buisnessProcessIds = BUSINESSPROCESSES ? (BUSINESSPROCESSES as string).split(',').map(Number) ?? [] : [];

    const cachedContacts = (await cacheManager.getKey<Customer[]>('customers')) ?? [];

    const contacts = cachedContacts
      .reduce((filteredArray, c) => {
        let checkConditions = true;

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
        // if (customerId > 0) {
        //   checkConditions = checkConditions && c.ID === customerId;
        // }
        if (checkConditions) {
          const customerLabels = labels[c.ID] ?? null;
          const BUSINESSPROCESSES = businessProcesses[c.ID] ?? null;
          filteredArray.push({
            ...c,
            NAME: c.NAME || '<не указано>',
            LABELS: customerLabels,
            BUSINESSPROCESSES,
          });
        }
        return filteredArray;
      }, []);

    return contacts;
  } finally {
    // console.log('');
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

export const customersService = {
  find,
  findOne
};
