import { InternalServerErrorException, UserType, IsNull, IsNotNull } from '@gsbelarus/util-api-types';
import { ticketsStateRepository } from '../repository';

const findAll = async (
  sessionID: string,
) => {
  try {
    const ticketStates = await ticketsStateRepository.find(sessionID);

    return {
      ticketStates: ticketStates
    };
  } catch (error) {
    throw InternalServerErrorException(error.message);
  }
};

const findOne = async (
  sessionID: string,
  id: string
) => {
  try {
    const ticketState = await ticketsStateRepository.findOne(sessionID, { id });

    return ticketState;
  } catch (error) {
    throw InternalServerErrorException(error.message);
  }
};

export const ticketsStateService = {
  findAll,
  findOne
};
