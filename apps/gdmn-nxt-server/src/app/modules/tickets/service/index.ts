import { InternalServerErrorException, UserType, NotFoundException, IsNull, IsNotNull, ITicket } from '@gsbelarus/util-api-types';
import { ticketsRepository } from '../repository';
import { ticketsMessagesService } from '@gdmn-nxt/modules/tickets-messages/service';

const findAll = async (
  sessionID: string,
  filter?: { [key: string]: any; },
  type?: UserType,
) => {
  try {
    const {
      active,
      conpanyKey,
      userId,
      state,
      performerKey,
      name,
      pageSize,
      pageNo,
    } = filter;

    let fromRecord = 0;
    let toRecord: number;

    if (pageNo && pageSize) {
      fromRecord = Number(pageNo) * Number(pageSize);
      toRecord = fromRecord + Number(pageSize);
    };

    const result = await ticketsRepository.find(
      sessionID,
      {
        // ...(active ? { USR$CLOSEAT: (active === 'true' ? IsNull : IsNotNull)() } : {}),
        ...(conpanyKey ? { USR$COMPANYKEY: conpanyKey ?? -1 } : {}),
        ...(userId ? { USR$USERKEY: userId } : {}),
        ...(state ? { USR$STATE: state } : {}),
        ...(performerKey ? { USR$PERFORMERKEY: performerKey } : {})
      },
      undefined,
      type
    );

    const tickets = result.reduce<ITicket[]>((filteredArray, ticket) => {
      let checkConditions = true;

      if (name) {
        const lowerName = String(name).toLowerCase();
        checkConditions = checkConditions && ticket.title.toLowerCase().includes(lowerName);
      }

      if ('active' in filter) {
        checkConditions = checkConditions && (active === 'true' ? !ticket.closeAt : !!ticket.closeAt);
      }

      if (checkConditions) {
        filteredArray.push({
          ...ticket
        });
      }
      return filteredArray;
    }, []);

    const usersWithPagination = tickets.slice(fromRecord, toRecord);
    const rowCount = tickets.length;

    const closed = result.filter(item => !!item.closeAt).length;

    return {
      tickets: usersWithPagination,
      count: rowCount,
      closed,
      open: result.length - closed
    };
  } catch (error) {
    throw InternalServerErrorException(error.message);
  }
};

const findOne = async (
  sessionID: string,
  id: string,
  type: UserType
) => {
  try {
    const ticket = await ticketsRepository.findOne(sessionID, { id }, type);

    return ticket;
  } catch (error) {
    throw InternalServerErrorException(error.message);
  }
};

const createTicket = async (
  sessionID: string,
  userId: number,
  body: Omit<ITicket, 'ID'>,
  type: UserType
) => {
  try {
    const newTicket = await ticketsRepository.save(sessionID, { ...body, userId }, type);
    const ticket = await ticketsRepository.findOne(sessionID, { ID: newTicket.ID }, type);

    const newMessage = await ticketsMessagesService.createMessage(
      sessionID,
      userId,
      {
        body: body.message,
        ticketKey: ticket.ID,
        state: ticket.state
      },
      type
    );

    return ticket;
  } catch (error) {
    throw InternalServerErrorException(error.message);
  }
};

const updateById = async (
  sessionID: string,
  id: number,
  body: Omit<ITicket, 'ID'>,
  type: UserType
) => {
  try {
    const oldTicket = await ticketsRepository.findOne(sessionID, { id }, type);

    if (oldTicket.closeAt) {
      throw new Error('Тикет завершен');
    }

    const updatedTicket = await ticketsRepository.update(sessionID, id, body, type);
    if (!updatedTicket?.ID) {
      throw NotFoundException(`Не найден тикет с id=${id}`);
    }
    const ticket = await ticketsRepository.findOne(sessionID, { id: updatedTicket.ID }, type);

    return ticket;
  } catch (error) {
    throw InternalServerErrorException(error.message);
  }
};

export const ticketsService = {
  findAll,
  createTicket,
  updateById,
  findOne
};
