import { IFilter, InternalServerErrorException, UserType, NotFoundException, ITicketUser } from '@gsbelarus/util-api-types';
import { ticketsUserRepository } from '../repository';
import { ERROR_MESSAGES } from '@gdmn/constants/server';

const findAll = async (
  sessionID: string,
  filter?: { [key: string]: any; },
  type?: UserType,
) => {
  const {
    userName,
    companyKey,
    isAdmin
  } = filter;

  try {
    const users = await ticketsUserRepository.find(
      sessionID,
      {
        ...(userName ? { USR$USERNAME: userName } : {}),
        ...(companyKey ? { USR$COMPANYKEY: Number(companyKey) } : {}),
        ...(isAdmin ? { USR$ISADMIN: isAdmin === 'true' ? 1 : 0 } : {})
      },
      undefined,
      type
    );

    return {
      users: users
    };
  } catch (error) {
    throw InternalServerErrorException(error.message);
  }
};

const create = async (
  sessionID: string,
  body: Omit<ITicketUser, 'ID'>,
  isAdmin?: boolean
) => {
  try {
    const oldUser = await ticketsUserRepository.findOne(sessionID, { USR$USERNAME: body.userName });
    if (oldUser) throw new Error(isAdmin ? 'Для клиента уже создана учетная запись администратора' : 'Логин должен быть уникальным');
    const newFilter = await ticketsUserRepository.save(sessionID, { ...body }, isAdmin);
    const user = await ticketsUserRepository.findOne(sessionID, { id: newFilter.ID });

    return user;
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
    const updatedSegment = await ticketsUserRepository.update(sessionID, id, body, type);
    if (!updatedSegment?.ID) {
      throw NotFoundException(`Не найден фильтр с id=${id}`);
    }
    const filter = await ticketsUserRepository.findOne(sessionID, { id: updatedSegment.ID }, type);

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
    const checkFilter = await ticketsUserRepository.findOne(sessionID, { ID: id }, type);
    if (!checkFilter?.ID) {
      throw NotFoundException(ERROR_MESSAGES.DATA_NOT_FOUND);
    }

    return await ticketsUserRepository.remove(sessionID, id, type);
  } catch (error) {
    throw InternalServerErrorException(error.message);
  }
};

export const ticketsUserService = {
  findAll,
  create,
  updateById,
  removeById
};
