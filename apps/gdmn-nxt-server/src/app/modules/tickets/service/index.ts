import { InternalServerErrorException, UserType, NotFoundException, ITicket, ForbiddenException } from '@gsbelarus/util-api-types';
import { ticketsRepository } from '../repository';
import { ticketsMessagesService } from '@gdmn-nxt/modules/tickets-messages/service';
import { cachedRequets } from '@gdmn-nxt/server/utils/cachedRequests';

const findAll = async (
  sessionID: string,
  filter?: { [key: string]: any; },
  type?: UserType,
) => {
  try {
    const {
      active,
      companyKey,
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
        ...(companyKey ? { USR$COMPANYKEY: companyKey ?? -1 } : {}),
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
    if (!body.company.ID) {
      throw new Error('Не указана организация создателя тикета');
    }

    const newTicket = await ticketsRepository.save(sessionID, { ...body, userId }, type);
    const ticket = await ticketsRepository.findOne(sessionID, { ID: newTicket.ID }, type);

    const newMessage = await ticketsMessagesService.createMessage(
      sessionID,
      userId,
      {
        body: body.message,
        ticketKey: ticket.ID,
        state: ticket?.state,
        sendAt: ticket.openAt,
        files: body.files
      },
      type,
      true,
    );

    cachedRequets.cacheRequest('customers');

    return ticket;
  } catch (error) {
    throw InternalServerErrorException(error.message);
  }
};

const updateById = async (
  sessionID: string,
  id: number,
  userId: number,
  body: Omit<ITicket, 'ID'>,
  type: UserType
) => {
  try {
    const oldTicket = await ticketsRepository.findOne(sessionID, { id }, type);

    const oldTicketIsOpen = !oldTicket.closeAt;
    const newTicketIsOpen = !body.closeAt;

    if (type === UserType.Tickets && !oldTicketIsOpen) {
      throw ForbiddenException('Тикет завершен');
    }

    const closeBy = (() => {
      if (oldTicketIsOpen) {
        if (!newTicketIsOpen) return userId;
        return undefined;
      }
      if (newTicketIsOpen) return undefined;
      return oldTicket?.closeBy?.ID;
    })();

    const closeAt = (() => {
      if (oldTicketIsOpen) {
        if (!newTicketIsOpen) return new Date();
        return undefined;
      }
      if (newTicketIsOpen) return undefined;
      return oldTicket.closeAt;
    })();

    const updatedTicket = await ticketsRepository.update(sessionID, id, { ...body, closeAt, closeBy: { ID: closeBy, fullName: '' } }, type);

    if (!updatedTicket?.ID) {
      throw NotFoundException(`Не найден тикет с id=${id}`);
    }

    const ticket = await ticketsRepository.findOne(sessionID, { id: updatedTicket.ID }, type);

    if (oldTicket.closeAt !== ticket.closeAt) cachedRequets.cacheRequest('customers');

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
