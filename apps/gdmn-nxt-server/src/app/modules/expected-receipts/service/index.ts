import { expectedReceiptsRepository } from '../repository';

const findAll = async (
  sessionID: string,
  filter?: { [key: string]: any }
) => {
  /** Sorting */
  const sortField = filter?.field ?? 'NAME';
  const sortMode = filter?.sort ?? 'ASC';
  /** Filtering */
  const includePerTime = filter.includePerTime === 'true';
  const dateBegin = filter.dateBegin;
  const dateEnd = filter.dateEnd;

  try {
    const contracts = await expectedReceiptsRepository.find(sessionID,
      {
        dateBegin,
        dateEnd,
        includePerTime,
      }
    );

    contracts.sort((a, b) => {
      const dataType = typeof (a[String(sortField).toLowerCase()] ?? b[String(sortField).toLowerCase()]);

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

      if (dataType === 'object') {
        const a = (nameA['NAME']).toLowerCase();
        const b = (nameB['NAME']).toLowerCase();
        return String(sortMode).toUpperCase() === 'ASC'
          ? a?.localeCompare(b)
          : b?.localeCompare(a);
      }

      return 0;
    });

    return contracts;
  } catch (error) {
    throw error;
  }
};

export const expectedReceiptsService = {
  findAll
};
