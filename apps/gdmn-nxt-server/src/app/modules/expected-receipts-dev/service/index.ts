import { IExpectedReceiptDevContract } from '@gsbelarus/util-api-types';
import { expectedReceiptsDevRepository } from '../repository';

const findAll = async (
  sessionID: string,
  filter?: { [key: string]: any }
) => {
  /** Sorting */
  const sortField = filter?.field ?? 'NAME';
  const sortMode = filter?.sort ?? 'ASC';
  /** Filtering */
  const includeZeroRest = filter.includeZeroRest === 'true';
  const includePlanned = filter.includePlanned === 'true';
  const endsInPeriod = filter.endsInPeriod === 'true';
  const inculdeFreezing = filter.inculdeFreezing === 'true';
  const dateBegin = filter.dateBegin;
  const dateEnd = filter.dateEnd;

  try {
    const clients = await expectedReceiptsDevRepository.find(sessionID,
      {
        dateBegin,
        dateEnd,
        includeZeroRest,
        includePlanned,
        endsInPeriod,
        inculdeFreezing
      }
    );

    const sortFun = (a, b): number => {
      const dataType = typeof (a[String(sortField).toLowerCase()] ?? b[String(sortField).toLowerCase()]);

      const getDate = (str: string) => {
        const dateString = str.substring(str.length - 10, str.length);
        const [day, month, year] = dateString.split('.');
        return new Date(`${year}-${month}-${day}`);
      };

      const nameA = (() => {
        const fieldValue = a[String(sortField).toLowerCase()];
        if (dataType === 'string') {
          return fieldValue?.toLowerCase() || '';
        }
        return fieldValue;
      })();

      const nameB = (() => {
        const fieldValue = b[String(sortField).toLowerCase()];
        if (typeof fieldValue === 'string') {
          return fieldValue?.toLowerCase() || '';
        }
        return fieldValue;
      })();

      if (String(sortField).toLowerCase() === 'number') {
        const dateA = getDate(nameA);
        const dateB = getDate(nameB);
        return String(sortMode).toUpperCase() === 'ASC'
          ? dateA?.getTime() - dateB?.getTime()
          : dateB?.getTime() - dateA?.getTime();
      }

      if (dataType === 'object') {
        const dataType = typeof (nameA[sortValueNames[sortField]] ?? nameB[sortValueNames[sortField]]);
        const a = (() => {
          const fieldValue = nameA[sortValueNames[sortField]];
          if (dataType === 'string') {
            return fieldValue?.toLowerCase() || '';
          }
          return fieldValue;
        })();

        const b = (() => {
          const fieldValue = nameB[sortValueNames[sortField]];
          if (typeof fieldValue === 'string') {
            return fieldValue?.toLowerCase() || '';
          }
          return fieldValue;
        })();

        if (dataType === 'string') {
          return String(sortMode).toUpperCase() === 'ASC'
            ? a?.localeCompare(b)
            : b?.localeCompare(a);
        }

        if (dataType === 'number') {
          return String(sortMode).toUpperCase() === 'ASC'
            ? a - b
            : b - a;
        }
      }

      return 0;
    };

    // let first = true;

    const sortValueNames = {
      customer: 'NAME',
      amount: 'value',
      rest: 'value'
    };

    clients?.sort((a, b) => {
      // b.contracts.sort(sortFun);

      // if (first)a.contracts.sort(sortFun);

      // first = false;

      if (String(sortField).toLowerCase() === 'customer') {
        const nameA = (() => {
          const fieldValue = a[String(sortField).toLowerCase()]['NAME'];
          return fieldValue?.toLowerCase() || '';
        })();

        const nameB = (() => {
          const fieldValue = b[String(sortField).toLowerCase()]['NAME'];
          return fieldValue?.toLowerCase() || '';
        })();

        return String(sortMode).toUpperCase() === 'ASC'
          ? nameA?.localeCompare(nameB)
          : nameB?.localeCompare(nameA);
      }


      const sumFun = (count: IExpectedReceiptDevContract, contract: IExpectedReceiptDevContract) => {
        return {
          ...contract,
          number: count.number === '' ? contract.number : count.number,
          amount: {
            value: count.amount.value + contract.amount.value,
            currency: count.amount.currency + contract.amount.currency
          },
          done: {
            value: count.done?.value + contract.done?.value,
            currency: count.done?.currency + contract.done?.currency
          },
          paid: {
            value: count.paid?.value + contract.paid?.value,
            currency: count.paid?.currency + contract.paid?.currency
          },
          rest: {
            value: count.rest?.value + contract.rest?.value,
            currency: count.rest?.currency + contract.rest?.currency
          },
        };
      };

      const init: IExpectedReceiptDevContract = {
        customer: {
          ID: -1,
          NAME: ''
        },
        number: '',
        dateBegin: '',
        dateEnd: '',
        planned: false,
        subject: '',
        amount: {
          value: 0,
          currency: 0
        },
        done: {
          value: 0,
          currency: 0
        },
        paid: {
          value: 0,
          currency: 0
        },
        rest: {
          value: 0,
          currency: 0
        }
      };

      const aSum = a.contracts.reduce(sumFun, init);
      const bSum = b.contracts.reduce(sumFun, init);

      console.log('123');

      return sortFun(aSum, bSum);
    });

    return clients;
  } catch (error) {
    throw error;
  }
};

export const expectedReceiptsDevService = {
  findAll
};
