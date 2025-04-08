import { debtsRepository } from '../repository';

const findAll = async (
  sessionID: string,
  filter?: { [key: string]: any }
) => {
  /** Sorting */
  const sortField = filter?.field ?? 'customer';
  const sortMode = filter?.sort ?? 'ASC';
  /** Filtering */
  const dateBegin = filter.dateBegin;
  const dateEnd = filter.dateEnd;

  try {
    const items = await debtsRepository.find(sessionID,
      {
        dateBegin,
        dateEnd
      }
    );

    items?.sort((a, b): number => {
      const dataType = typeof (a[sortField] ?? b[sortField]);

      const nameA = (() => {
        const fieldValue = a[sortField];
        if (dataType === 'string') {
          return fieldValue?.toLowerCase() || '';
        }
        return fieldValue;
      })();

      const nameB = (() => {
        const fieldValue = b[sortField];
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
        const a = sortField === 'change' ? Math.abs(nameA) : nameA;
        const b = sortField === 'change' ? Math.abs(nameB) : nameB;

        return String(sortMode).toUpperCase() === 'ASC'
          ? a - b
          : b - a;
      }

      if (dataType === 'object') {
        if (sortField === 'customer') {
          const a = (nameA['NAME']).toLowerCase();
          const b = (nameB['NAME']).toLowerCase();
          return String(sortMode).toUpperCase() === 'ASC'
            ? a?.localeCompare(b)
            : b?.localeCompare(a);
        }

        const a = nameA['value'];
        const b = nameB['value'];
        return String(sortMode).toUpperCase() === 'ASC'
          ? a - b
          : b - a;;
      }

      return 0;
    });

    return items;
  } catch (error) {
    throw error;
  }
};

export const debtsService = {
  findAll
};
