import { IFilter, InternalServerErrorException, NotFoundException } from '@gsbelarus/util-api-types';
import { filtersRepository } from '../repository';
import { ERROR_MESSAGES } from '@gdmn/constants/server';

const findAll = async (
  sessionID: string,
  userId: number,
  entityName?: string
) => {
  try {
    const filters = await filtersRepository.find(
      sessionID,
      {
        ...(entityName && { USR$ENTITYNAME: entityName }),
        USR$USERKEY: userId
      }
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
  body: Omit<IFilter, 'ID'>
) => {
  try {
    const newFilter = await filtersRepository.save(sessionID, { ...body, userId });
    const filter = await filtersRepository.findOne(sessionID, { id: newFilter.ID });

    return filter;
  } catch (error) {
    throw InternalServerErrorException(error.message);
  }
};

const updateById = async (
  sessionID: string,
  id: number,
  body: Omit<IFilter, 'ID'>
) => {
  try {
    const updatedSegment = await filtersRepository.update(sessionID, id, body);
    if (!updatedSegment?.ID) {
      throw NotFoundException(`Не найден фильтр с id=${id}`);
    }
    const filter = await filtersRepository.findOne(sessionID, { id: updatedSegment.ID });

    return filter;
  } catch (error) {
    throw InternalServerErrorException(error.message);
  }
};

const removeById = async (
  sessionID: string,
  id: number
) => {
  try {
    const checkFilter = await filtersRepository.findOne(sessionID, { ID: id });
    if (!checkFilter?.ID) {
      throw NotFoundException(ERROR_MESSAGES.DATA_NOT_FOUND);
    }

    return await filtersRepository.remove(sessionID, id);
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
