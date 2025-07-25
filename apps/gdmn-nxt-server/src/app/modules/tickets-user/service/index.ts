import { InternalServerErrorException, UserType, NotFoundException, ITicketUser, ForbiddenException } from '@gsbelarus/util-api-types';
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
    isAdmin,
    name,
    pageSize,
    pageNo,
    sortField,
    sortMode
  } = filter;

  try {
    let fromRecord = 0;
    let toRecord: number;

    if (pageNo && pageSize) {
      fromRecord = Number(pageNo) * Number(pageSize);
      toRecord = fromRecord + Number(pageSize);
    };

    const result = await ticketsUserRepository.find(
      sessionID,
      {
        ...(userName ? { USR$USERNAME: userName } : {}),
        ...(companyKey ? { USR$COMPANYKEY: Number(companyKey) } : {}),
        ...(isAdmin ? { USR$ISADMIN: isAdmin === 'true' ? 1 : 0 } : {}),
      },
      undefined,
      type
    );

    const users = result.reduce<ITicketUser[]>((filteredArray, user) => {
      let checkConditions = true;

      if (name) {
        const lowerName = String(name).toLowerCase();
        checkConditions = checkConditions && user.fullName.toLowerCase().includes(lowerName);
      }

      if (checkConditions) {
        filteredArray.push({
          ...user
        });
      }
      return filteredArray;
    }, []).sort((a, b) => {
      const dataType = typeof (a[String(sortField)] ?? b[String(sortField)]);

      const nameA = (() => {
        const fieldValue = a[String(sortField)];
        if (dataType === 'string') {
          return fieldValue?.toLowerCase() || '';
        }
        return fieldValue;
      })();

      const nameB = (() => {
        const fieldValue = b[String(sortField)];
        if (typeof fieldValue === 'string') {
          return fieldValue?.toLowerCase() || '';
        }
        return fieldValue;
      })();

      return String(sortMode).toUpperCase() === 'ASC'
        ? nameA?.localeCompare(nameB)
        : nameB?.localeCompare(nameA);
    });

    const usersWithPagination = users.slice(fromRecord, toRecord);
    const rowCount = users.length;

    return {
      users: usersWithPagination,
      count: rowCount
    };
  } catch (error) {
    throw InternalServerErrorException(error.message);
  }
};

const findOne = async (
  sessionID: string,
  userId: number,
  type: UserType
) => {
  try {
    const user = await ticketsUserRepository.findOne(sessionID, { id: userId }, type);

    return user;
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
  body: Omit<ITicketUser, 'ID'>
) => {
  try {
    const updatedUser = await ticketsUserRepository.update(sessionID, id, body);
    if (!updatedUser?.ID) {
      throw NotFoundException(`Не найден пользователь с id=${id}`);
    }
    const user = await ticketsUserRepository.findOne(sessionID, { id: updatedUser.ID });

    return user;
  } catch (error) {
    throw InternalServerErrorException(error.message);
  }
};

const removeById = async (
  sessionID: string,
  id: number,
  type: UserType,
  editorCompanuKey: number
) => {
  try {
    const checkUser = await ticketsUserRepository.findOne(sessionID, { ID: id }, type);
    if (!checkUser?.ID) {
      throw NotFoundException(ERROR_MESSAGES.DATA_NOT_FOUND);
    }

    if (type === UserType.Tickets && editorCompanuKey !== checkUser.company.ID) {
      throw ForbiddenException('Организация удаляемого ответственного лица отличается от вашей');
    }

    return await ticketsUserRepository.remove(sessionID, id, type);
  } catch (error) {
    throw InternalServerErrorException(error.message);
  }
};

export const ticketsUserService = {
  findAll,
  findOne,
  create,
  updateById,
  removeById
};
