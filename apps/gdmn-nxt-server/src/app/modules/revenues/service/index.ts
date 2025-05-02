import { revenueRepository } from '../repository';

const findAll = async (
  sessionID: string,
  filter?: { [key: string]: any }
) => {
  /** Sorting */
  const sortField = filter?.field ?? 'article';
  const sortMode = filter?.sort ?? 'ASC';
  /** Filtering */
  const groupByOrganization = filter.groupByOrganization === 'true';
  const customer = filter.customer;
  const dateBegin = filter.dateBegin;
  const dateEnd = filter.dateEnd;

  try {
    const items = await revenueRepository.find(sessionID,
      {
        dateBegin,
        dateEnd,
        groupByOrganization,
        customer
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

      if (String(sortField).toLowerCase() === 'date') {
        const dateA = new Date(nameA);
        const dateB = new Date(nameB);
        return String(sortMode).toUpperCase() === 'ASC'
          ? dateA?.getTime() - dateB?.getTime()
          : dateB?.getTime() - dateA?.getTime();
      }

      if (dataType === 'number') {
        return String(sortMode).toUpperCase() === 'ASC'
          ? nameA - nameB
          : nameB - nameA;
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

export const revenueService = {
  findAll
};
