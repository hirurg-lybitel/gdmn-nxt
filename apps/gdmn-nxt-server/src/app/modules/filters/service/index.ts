import { IFilter, InternalServerErrorException, UserType, NotFoundException } from '@gsbelarus/util-api-types';
import { filtersRepository } from '../repository';
import { ERROR_MESSAGES } from '@gdmn/constants/server';

const findAll = async (
  sessionID: string,
  userId: number,
  type?: UserType,
  entityName?: string,
) => {
  try {
    const filters = await filtersRepository.find(
      sessionID,
      {
        ...(entityName && { USR$ENTITYNAME: entityName }),
        USR$USERKEY: userId
      },
      undefined,
      type
    );

    return {
      filters: filters
    };
  } catch (error) {
    throw InternalServerErrorException(error.message);
  }
};

const createFilter = async (
  sessionID: string,
  userId: number,
  body: Omit<IFilter, 'ID'>,
  type: UserType
) => {
  try {
    const newFilter = await filtersRepository.save(sessionID, { ...body, userId }, type);
    const filter = await filtersRepository.findOne(sessionID, { id: newFilter.ID }, type);

    return filter;
  } catch (error) {
    throw InternalServerErrorException(error.message);
  }
};

const updateById = async (
  sessionID: string,
  id: number,
  body: Omit<IFilter, 'ID'>,
  type: UserType
) => {
  try {
    const updatedSegment = await filtersRepository.update(sessionID, id, body, type);
    if (!updatedSegment?.ID) {
      throw NotFoundException(`Не найден фильтр с id=${id}`);
    }
    const filter = await filtersRepository.findOne(sessionID, { id: updatedSegment.ID }, type);

    return filter;
  } catch (error) {
    throw InternalServerErrorException(error.message);
  }
};

const removeById = async (
  sessionID: string,
  id: number,
  type: UserType
) => {
  try {
    const checkFilter = await filtersRepository.findOne(sessionID, { ID: id }, type);
    if (!checkFilter?.ID) {
      throw NotFoundException(ERROR_MESSAGES.DATA_NOT_FOUND);
    }

    return await filtersRepository.remove(sessionID, id, type);
  } catch (error) {
    throw InternalServerErrorException(error.message);
  }
};

export const filtersService = {
  findAll,
  createFilter,
  updateById,
  removeById
};
