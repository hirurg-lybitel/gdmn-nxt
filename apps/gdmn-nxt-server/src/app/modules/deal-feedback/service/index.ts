import { IDealFeedback, InternalServerErrorException, NotFoundException } from '@gsbelarus/util-api-types';
import { dealFeedbackRepository } from '../repository';

type DealFeedbackDto = Omit<IDealFeedback, 'ID'>;

const findAll = async (
  sessionID: string,
  clause = {}
) => {
  try {
    return await dealFeedbackRepository.find(sessionID, clause);
  } catch (error) {
    throw error;
  }
};

const createFeedback = async (
  sessionID: string,
  body: DealFeedbackDto
) => {
  try {
    return await dealFeedbackRepository.save(sessionID, body);
  } catch (error) {
    throw error;
  }
};

const updateFeedback = async (
  sessionID: string,
  id: number,
  body: Partial<DealFeedbackDto>
) => {
  try {
    const feedback = await dealFeedbackRepository.findOne(sessionID, { id });
    if (!feedback) {
      throw NotFoundException(`Не найдена запись с id=${id}`);
    }
    const updatedFeedback =
        await dealFeedbackRepository.update(
          sessionID,
          id,
          body,
        );
    if (!updatedFeedback) {
      throw InternalServerErrorException('Ошибка при обновлении обратной связи');
    }

    return await dealFeedbackRepository.findOne(sessionID, { id });
  } catch (error) {
    throw error;
  }
};

const removeById = async (
  sessionID: string,
  id: number
) => {
  try {
    const feedback = await dealFeedbackRepository.findOne(sessionID, { id });
    if (!feedback) {
      throw NotFoundException(`Не найдена запись с id=${id}`);
    }
    const isDeleted = await dealFeedbackRepository.remove(sessionID, id);

    if (!isDeleted) {
      throw InternalServerErrorException('Ошибка при удалении обратной связи');
    }

    return isDeleted;
  } catch (error) {
    throw error;
  }
};

const findByDeal = async (sessionID: string, dealId: number) => {
  try {
    return await dealFeedbackRepository.find(sessionID, {
      'USR$DEAL': dealId
    });
  } catch (error) {
    throw error;
  }
};

export const dealFeedbackService = {
  findAll,
  findByDeal,
  createFeedback,
  updateFeedback,
  removeById
};
