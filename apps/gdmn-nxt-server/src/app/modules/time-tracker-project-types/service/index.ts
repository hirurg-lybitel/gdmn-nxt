import { InternalServerErrorException, IProjectType, NotFoundException } from '@gsbelarus/util-api-types';
import { ERROR_MESSAGES } from '@gdmn/constants/server';
import { timeTrackingProjectTypesRepository } from '../repository';

const findAll = async (
  sessionID: string,
  filter?: { [key: string]: any }
) => {
  try {
    return await timeTrackingProjectTypesRepository.find(sessionID, {});
  } catch (error) {
    throw error;
  }
};

const create = async (
  sessionID: string,
  body: IProjectType
) => {
  try {
    return await timeTrackingProjectTypesRepository.save(sessionID, body);
  } catch (error) {
    throw error;
  }
};

const update = async (
  sessionID: string,
  id: number,
  body: Partial<IProjectType>
) => {
  try {
    const timeTrack = await timeTrackingProjectTypesRepository.findOne(sessionID, { id });
    if (!timeTrack) {
      throw NotFoundException(ERROR_MESSAGES.DATA_NOT_FOUND_WITH_ID(id));
    }
    const updatedProjectType =
        await timeTrackingProjectTypesRepository.update(
          sessionID,
          id,
          body,
        );
    if (!updatedProjectType) {
      throw InternalServerErrorException(ERROR_MESSAGES.UPDATE_FAILED);
    }

    return await timeTrackingProjectTypesRepository.findOne(sessionID, { id });
  } catch (error) {
    throw error;
  }
};

const remove = async (
  sessionID: string,
  id: number
) => {
  try {
    const projectType = await timeTrackingProjectTypesRepository.findOne(sessionID, { id });
    if (!projectType) {
      throw NotFoundException(ERROR_MESSAGES.DATA_NOT_FOUND_WITH_ID(id));
    }
    const isDeleted = await timeTrackingProjectTypesRepository.remove(sessionID, id);

    if (!isDeleted) {
      throw InternalServerErrorException(ERROR_MESSAGES.DELETE_FAILED);
    }

    return isDeleted;
  } catch (error) {
    throw error;
  }
};

export const timeTrackingProjectTypesService = {
  create,
  update,
  remove,
  findAll
};
