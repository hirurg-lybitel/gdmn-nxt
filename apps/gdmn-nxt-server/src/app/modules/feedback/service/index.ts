import { ICustomerFeedback, InternalServerErrorException, NotFoundException, UnprocessableEntityException } from '@gsbelarus/util-api-types';
import { feedbackRepository } from '../repository';

type CustomerFeedbackDto = Omit<ICustomerFeedback, 'ID'>;

const createFeedback = async (
  sessionID: string,
  body: CustomerFeedbackDto,
  contactKey: number
) => {
  try {
    return await feedbackRepository.save(sessionID, { ...body, creator: { ID: contactKey } as any });
  } catch (error) {
    throw error;
  }
};

const updateFeedback = async (
  sessionID: string,
  id: number,
  body: Partial<CustomerFeedbackDto>
) => {
  try {
    const feedback = await feedbackRepository.findOne(sessionID, { id });
    if (!feedback) {
      throw NotFoundException(`Не найдена запись с id=${id}`);
    }
    const updatedFeedback =
        await feedbackRepository.update(
          sessionID,
          id,
          body,
        );
    if (!updatedFeedback) {
      throw InternalServerErrorException('Ошибка при обновлении обратной связи');
    }

    return await feedbackRepository.findOne(sessionID, { id });
  } catch (error) {
    throw error;
  }
};

const removeById = async (
  sessionID: string,
  id: number
) => {
  try {
    const feedback = await feedbackRepository.findOne(sessionID, { id });
    if (!feedback) {
      throw NotFoundException(`Не найдена запись с id=${id}`);
    }
    const isDeleted = await feedbackRepository.remove(sessionID, id);

    if (!isDeleted) {
      throw InternalServerErrorException('Ошибка при удалении обратной связи');
    }

    return isDeleted;
  } catch (error) {
    throw error;
  }
};

const findAllByCustomer = async (
  sessionID: string,
  customerId: number
) => {
  try {
    return await feedbackRepository.find(sessionID, {
      'USR$CUSTOMERKEY': customerId
    });
  } catch (error) {
    throw error;
  }
};

export const feedbackService = {
  createFeedback,
  updateFeedback,
  removeById,
  findAllByCustomer
};
