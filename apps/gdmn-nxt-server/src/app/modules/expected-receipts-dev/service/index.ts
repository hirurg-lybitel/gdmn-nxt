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
    const contracts = await expectedReceiptsDevRepository.find(sessionID,
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

    contracts?.sort(sortFun);

    return contracts;
  } catch (error) {
    throw error;
  }
};

export const expectedReceiptsDevService = {
  findAll
};
