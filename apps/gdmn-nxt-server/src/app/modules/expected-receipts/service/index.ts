import { ITimeTrackTask } from '@gsbelarus/util-api-types';
import { expectedReceiptsRepository } from '../repository';

const findAll = async (
  sessionID: string,
  filter?: { [key: string]: any }
) => {
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

    return contracts;
  } catch (error) {
    throw error;
  }
};

export const expectedReceiptsService = {
  findAll
};
