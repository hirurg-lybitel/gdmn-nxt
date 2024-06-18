import { ITemplate, InternalServerErrorException, Like, NotFoundException } from '@gsbelarus/util-api-types';
import { ERROR_MESSAGES } from '@gdmn/constants/server';
import { templatesRepository } from '../repository';

const findAll = async (
  sessionID: string,
  filter?: { [key: string]: any }
) => {
  try {
    const pageSize = filter?.pageSize;
    const pageNo = filter?.pageNo;
    const name = filter?.name;

    const templates = await templatesRepository.find(
      sessionID,
      {
        ...(name && { USR$NAME: Like(name) }),
      });

    let fromRecord = 0;
    let toRecord: number;

    if (pageNo && pageSize) {
      fromRecord = Number(pageNo) * Number(pageSize);
      toRecord = fromRecord + Number(pageSize);
    };

    const templatesWithPagination = templates.slice(fromRecord, toRecord);
    const count = templates.length;

    return {
      templates: templatesWithPagination,
      count
    };
  } catch (error) {
    throw InternalServerErrorException(error.message);
  }
};

const findOne = async (
  sessionID: string,
  id: number
) => {
  try {
    const template = await templatesRepository.findOne(sessionID, { ID: id });
    if (!template?.ID) {
      throw NotFoundException(ERROR_MESSAGES.DATA_NOT_FOUND);
    }

    return template;
  } catch (error) {
    throw InternalServerErrorException(error.message);
  }
};

const createTemplate = async (
  sessionID: string,
  body: Omit<ITemplate, 'ID'>
) => {
  try {
    const newTemplate = await templatesRepository.save(sessionID, body);
    const template = await templatesRepository.findOne(sessionID, { id: newTemplate.ID });

    return template;
  } catch (error) {
    throw InternalServerErrorException(error.message);
  }
};

const updateById = async (
  sessionID: string,
  id: number,
  body: Omit<ITemplate, 'ID'>
) => {
  try {
    const updatedTemplate = await templatesRepository.update(sessionID, id, body);
    if (!updatedTemplate?.ID) {
      throw NotFoundException(`Не найден шаблон с id=${id}`);
    }
    const template = await templatesRepository.findOne(sessionID, { id: updatedTemplate.ID });

    return template;
  } catch (error) {
    throw InternalServerErrorException(error.message);
  }
};

const removeById = async (
  sessionID: string,
  id: number
) => {
  try {
    const checkTemplate = await templatesRepository.findOne(sessionID, { ID: id });
    if (!checkTemplate?.ID) {
      throw NotFoundException(ERROR_MESSAGES.DATA_NOT_FOUND);
    }

    return await templatesRepository.remove(sessionID, id);
  } catch (error) {
    throw InternalServerErrorException(error.message);
  }
};

export const templatesService = {
  findAll,
  findOne,
  createTemplate,
  updateById,
  removeById
};
