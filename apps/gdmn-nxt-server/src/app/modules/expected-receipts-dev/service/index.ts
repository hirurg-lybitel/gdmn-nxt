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
  const dateBegin = filter.dateBegin;
  const dateEnd = filter.dateEnd;

  try {
    const contracts = await expectedReceiptsDevRepository.find(sessionID,
      {
        dateBegin,
        dateEnd,
        includeZeroRest,
      }
    );

    return contracts;
  } catch (error) {
    throw error;
  }
};

export const expectedReceiptsDevService = {
  findAll
};
