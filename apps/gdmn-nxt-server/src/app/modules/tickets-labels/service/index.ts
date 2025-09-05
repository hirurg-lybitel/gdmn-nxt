import { ILabel, InternalServerErrorException, NotFoundException, UserType } from '@gsbelarus/util-api-types';
import { ticketsLabelsRepository } from '../repository';

const findAll = async (
  sessionID: string
) => {
  try {
    const labels = await ticketsLabelsRepository.find(sessionID);

    return {
      labels: labels
    };
  } catch (error) {
    throw InternalServerErrorException(error.message);
  }
};

const createLabel = async (
  sessionID: string,
  body: Omit<ILabel, 'ID'>
) => {
  try {
    const newLabel = await ticketsLabelsRepository.save(sessionID, body);

    const label = await ticketsLabelsRepository.findOne(sessionID, { ID: newLabel?.ID });

    if (!label?.ID) {
      throw NotFoundException(`Не найдена метка с id=${newLabel?.ID}`);
    }

    return label;
  } catch (error) {
    throw InternalServerErrorException(error.message);
  }
};

const updateById = async (
  sessionID: string,
  id: number,
  body: Omit<ILabel, 'ID'>
) => {
  try {
    const updatedLabel = await ticketsLabelsRepository.update(sessionID, id, body);

    if (!updatedLabel?.ID) {
      throw NotFoundException(`Не найдена метка с id=${id}`);
    }

    const label = await ticketsLabelsRepository.findOne(sessionID, { ID: updatedLabel.ID });

    return label;
  } catch (error) {
    throw InternalServerErrorException(error.message);
  }
};

const removeById = async (
  sessionID: string,
  id: number,
) => {
  try {
    const oldLabel = await ticketsLabelsRepository.findOne(sessionID, { ID: id });

    if (!oldLabel?.ID) {
      throw NotFoundException(`Не найдено сообщение с id=${id}`);
    }

    return await ticketsLabelsRepository.remove(sessionID, id);
  } catch (error) {
    throw InternalServerErrorException(error.message);
  }
};

export const ticketsLabelsService = {
  findAll,
  createLabel,
  updateById,
  removeById
};
