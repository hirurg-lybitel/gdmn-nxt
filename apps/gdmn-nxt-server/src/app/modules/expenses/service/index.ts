import { expensesRepository } from '../repository';

const findAll = async (
  sessionID: string,
  filter?: { [key: string]: any }
) => {
  /** Sorting */
  const sortField = filter?.field ?? 'article';
  const sortMode = filter?.sort ?? 'ASC';
  /** Filtering */
  const dateBegin = filter.dateBegin;
  const dateEnd = filter.dateEnd;

  try {
    const items = await expensesRepository.find(sessionID,
      {
        dateBegin,
        dateEnd
      }
    );

    items?.sort((a, b): number => {
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

      return 0;
    });

    return items;
  } catch (error) {
    throw error;
  }
};

export const expensesService = {
  findAll
};
