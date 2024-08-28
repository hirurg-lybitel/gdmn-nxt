import { InternalServerErrorException, ITimeTrack, ITimeTrackGroup, NotFoundException } from '@gsbelarus/util-api-types';
import { timeTrackingRepository } from '../repository';
import { ERROR_MESSAGES } from '@gdmn/constants/server';
import dayjs from '@gdmn-nxt/dayjs';

type TimeTrackingDto = Omit<ITimeTrack, 'ID'>;

function groupByDate(arr: ITimeTrack[]): ITimeTrackGroup[] {
  const grouped = arr.reduce((acc, item) => {
    const date = item.date;
    const dateStr = date.toISOString();
    if (!acc[dateStr]) {
      acc[dateStr] = { date, duration: '', items: [] };
    }
    acc[dateStr].items.push(item);

    if (item.duration) {
      if (acc[dateStr].duration) {
        acc[dateStr].duration = dayjs
          .duration(acc[dateStr].duration)
          .add(
            dayjs
              .duration(item.duration)
          )
          .toISOString();
      } else {
        acc[dateStr].duration = item.duration;
      }
    }
    return acc;
  }, {} as any);

  return Object.values(grouped) as any;
};


const findAll = async (
  sessionID: string,
  filter?: { [key: string]: any }
) => {
  const userId = filter.userId;
  try {
    return await timeTrackingRepository.find(sessionID, {
      ...(userId && { 'USR$USERKEY': userId }),
    });
  } catch (error) {
    throw error;
  }
};

const findAllByGroup = async (
  sessionID: string,
  filter?: { [key: string]: any }
) => {
  const userId = filter.userId;
  try {
    const timeTracking = await timeTrackingRepository.find(sessionID, {
      ...(userId && {
        'USR$USERKEY': userId,
        'USR$INPROGRESS': 0
      }),
    });
    return groupByDate(timeTracking);
  } catch (error) {
    throw error;
  }
};

const findInProgress = async (
  sessionID: string,
  filter?: { [key: string]: any }
) => {
  const userId = filter.userId;
  try {
    return await timeTrackingRepository.findOne(sessionID, {
      ...(userId && {
        'USR$USERKEY': userId,
        'USR$INPROGRESS': 1
      }),
    });
  } catch (error) {
    throw error;
  }
};

const create = async (
  sessionID: string,
  body: TimeTrackingDto
) => {
  try {
    return await timeTrackingRepository.save(sessionID, body);
  } catch (error) {
    throw error;
  }
};

const update = async (
  sessionID: string,
  id: number,
  body: Partial<TimeTrackingDto>
) => {
  try {
    const timeTrack = await timeTrackingRepository.findOne(sessionID, { id });
    if (!timeTrack) {
      throw NotFoundException(ERROR_MESSAGES.DATA_NOT_FOUND_WITH_ID(id));
    }
    const updatedTimeTrack =
        await timeTrackingRepository.update(
          sessionID,
          id,
          body,
        );
    if (!updatedTimeTrack) {
      throw InternalServerErrorException(ERROR_MESSAGES.UPDATE_FAILED);
    }

    return await timeTrackingRepository.findOne(sessionID, { id });
  } catch (error) {
    throw error;
  }
};

const remove = async (
  sessionID: string,
  id: number
) => {
  try {
    const timeTrack = await timeTrackingRepository.findOne(sessionID, { id });
    if (!timeTrack) {
      throw NotFoundException(ERROR_MESSAGES.DATA_NOT_FOUND_WITH_ID(id));
    }
    const isDeleted = await timeTrackingRepository.remove(sessionID, id);

    if (!isDeleted) {
      throw InternalServerErrorException(ERROR_MESSAGES.DELETE_FAILED);
    }

    return isDeleted;
  } catch (error) {
    throw error;
  }
};

export const timeTrackingService = {
  create,
  update,
  remove,
  findAll,
  findAllByGroup,
  findInProgress
};
