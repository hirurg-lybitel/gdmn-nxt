import { acquireReadTransaction, startTransaction } from '@gdmn-nxt/db-connection';
import { customersService } from '@gdmn-nxt/modules/customers/service';
import { FindHandler, FindOneHandler, ITicketUser, RemoveOneHandler, UpdateHandler, UserType } from '@gsbelarus/util-api-types';
import { prepareClause } from '@gsbelarus/util-helpers';
import { hash } from 'bcryptjs';

const find: FindHandler<ITicketUser> = async (
  sessionID,
  clause = {},
  _,
  type
) => {
  const { fetchAsObject, releaseReadTransaction } = await acquireReadTransaction(sessionID);

  try {
    const { clauseString, whereClause } = prepareClause(clause, { prefix: () => 'f' });

    const sql = `
      SELECT
        f.ID,
        f.USR$PASSWORD,
        f.USR$COMPANYKEY,
        f.USR$FULLNAME,
        f.USR$USERNAME,
        f.USR$EMAIL,
        f.USR$PHONE,
        f.USR$ISADMIN,
        USR$ONE_TIME_PASSWORD
      FROM USR$CRM_USER f
      ${clauseString.length > 0 ? ` WHERE ${clauseString}` : ''}`;

    const result = await fetchAsObject<any>(sql, whereClause);

    const customers = await customersService.find(sessionID, { ticketSystem: 'true' });

    let sortedCustomers = {};

    for (const customer of customers) {
      sortedCustomers = { ...sortedCustomers, [customer.ID]: customer };
    }

    const users: ITicketUser[] = await Promise.all(result.map(async (data) => {
      return {
        ID: data['ID'],
        ...(type === UserType.Gedemin ? { password: data['USR$PASSWORD'] } : {}),
        company: sortedCustomers[data['USR$COMPANYKEY']],
        fullName: data['USR$FULLNAME'],
        ...(type === UserType.Gedemin ? { userName: data['USR$USERNAME'] } : {}),
        email: data['USR$EMAIL'],
        phone: data['USR$PHONE'],
        isAdmin: data['USR$ISADMIN'] === 1,
        oneTimePassword: data['USR$ONE_TIME_PASSWORD'] === 1
      };
    }));

    return users;
  } finally {
    releaseReadTransaction();
  }
};

const findOne: FindOneHandler<ITicketUser> = async (sessionID, clause = {}, type) => {
  const user = await find(sessionID, clause, undefined, type);

  if (user.length === 0) {
    return Promise.resolve(undefined);
  }

  return user[0];
};

const update: UpdateHandler<ITicketUser> = async (
  sessionID,
  id,
  metadata
) => {
  const { fetchAsSingletonObject, releaseTransaction } = await startTransaction(sessionID);

  try {
    const ID = id;

    const {
      password,
      isAdmin
    } = metadata;

    const updatedFilter = await fetchAsSingletonObject<ITicketUser>(
      `UPDATE USR$CRM_USER
      SET
        ${password ? 'USR$PASSWORD = :PASSWORD,' : ''}
        USR$ISADMIN = :ISADMIN,
        USR$ONE_TIME_PASSWORD = :ONE_TIME_PASSWORD
      WHERE
        ID = :ID
      RETURNING ID`,
      {
        ID,
        ...(password ? { PASSWORD: await hash(password, 12) } : {}),
        ISADMIN: isAdmin,
        ONE_TIME_PASSWORD: false
      }
    );

    await releaseTransaction();

    return updatedFilter;
  } catch (error) {
    await releaseTransaction(false);
    throw new Error(error);
  }
};

export type Save = (sessionID: string, metadata: Omit<ITicketUser, 'ID' | 'id'>, isAdmin?: boolean, type?: UserType) => Promise<ITicketUser>;

const save: Save = async (
  sessionID,
  metadata,
  isAdmin
) => {
  const { fetchAsSingletonObject, releaseTransaction } = await startTransaction(sessionID);

  const { company, password: propPassword, fullName, userName, email, phone, isAdmin: isAdminMeta } = metadata;

  const password = isAdmin ? propPassword : await hash(propPassword, 12);

  try {
    const user = await fetchAsSingletonObject<ITicketUser>(
      `INSERT INTO USR$CRM_USER(USR$COMPANYKEY, USR$PASSWORD, USR$FULLNAME, USR$USERNAME, USR$EMAIL, USR$PHONE, USR$ISADMIN, USR$ONE_TIME_PASSWORD)
      VALUES(:COMPANYKEY, :PASSWORD, :FULLNAME, :USERNAME, :EMAIL, :PHONE, :ISADMIN, :ONE_TIME_PASSWORD)
      RETURNING ID`,
      {
        COMPANYKEY: company.ID,
        PASSWORD: password,
        FULLNAME: fullName,
        USERNAME: userName,
        EMAIL: email,
        PHONE: phone,
        ISADMIN: isAdmin ?? isAdminMeta ?? false,
        ONE_TIME_PASSWORD: isAdmin ?? false
      }
    );

    const profile = await fetchAsSingletonObject(
      `INSERT INTO USR$CRM_T_USER_PROFILE_SETTINGS(USR$USERKEY, USR$SEND_EMAIL_NOTIFICATION, USR$PUSH_NOTIFICATIONS, USR$SAVEFILTERS)
      VALUES(:USERKEY, :SEND_EMAIL_NOTIFICATION, :PUSH_NOTIFICATIONS, :SAVEFILTERS)
      RETURNING ID`,
      {
        USERKEY: user.ID,
        SEND_EMAIL_NOTIFICATION: true,
        PUSH_NOTIFICATIONS: true,
        SAVEFILTERS: true
      }
    );

    await releaseTransaction();

    return user;
  } catch (error) {
    await releaseTransaction(false);
    throw new Error(error);
  }
};

const remove: RemoveOneHandler = async (
  sessionID,
  id,
  type
) => {
  const { fetchAsSingletonObject, releaseTransaction } = await startTransaction(sessionID);

  try {
    const deletedProfile = await fetchAsSingletonObject<{ ID: number; }>(
      `DELETE FROM USR$CRM_T_USER_PROFILE_SETTINGS WHERE USR$USERKEY = :id
      RETURNING ID`,
      { id }
    );

    const deletedUser = await fetchAsSingletonObject<{ ID: number; }>(
      `DELETE FROM USR$CRM_USER WHERE ID = :id
      RETURNING ID`,
      { id }
    );

    await releaseTransaction();

    return !!deletedUser.ID;
  } catch (error) {
    await releaseTransaction(false);
    throw new Error(error);
  }
};

export const ticketsUserRepository = {
  find,
  findOne,
  update,
  save,
  remove
};
