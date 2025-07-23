import { acquireReadTransaction, startTransaction } from '@gdmn-nxt/db-connection';
import { FindHandler, FindOneHandler, FindOperator, IFilter, ITicketUser, RemoveOneHandler, UpdateHandler, UserType } from '@gsbelarus/util-api-types';

const find: FindHandler<ITicketUser> = async (
  sessionID,
  clause = {},
  _,
  type
) => {
  const { fetchAsObject, releaseReadTransaction } = await acquireReadTransaction(sessionID);

  try {
    const params = [];
    const clauseString = Object
      .keys({ ...clause })
      .map(f => {
        if (typeof clause[f] === 'object' && 'operator' in clause[f]) {
          const expression = clause[f] as FindOperator;
          switch (expression.operator) {
            case 'LIKE':
              return ` UPPER(f.${f}) ${expression.value} `;
          }
        }
        params.push(clause[f]);
        return ` f.${f} = ?`;
      })
      .join(' AND ');

    const sql = `
      SELECT
        f.ID,
        CASE
          WHEN f.USR$ONE_TIME_PASSWORD = 1 THEN f.USR$PASSWORD
          ELSE NULL
        END AS USR$PASSWORD,
        f.USR$COMPANYKEY,
        f.USR$FULLNAME,
        f.USR$USERNAME,
        f.USR$EMAIL,
        f.USR$PHONE,
        f.USR$ISADMIN
      FROM USR$CRM_USER f
      ${clauseString.length > 0 ? ` WHERE ${clauseString}` : ''}`;

    const result = await fetchAsObject<any>(sql, params);

    const users: ITicketUser[] = await Promise.all(result.map(async (data) => {
      return {
        ID: data['ID'],
        ...(type === UserType.CRM ? { password: data['USR$PASSWORD'] } : {}),
        company: data['USR$COMPANYKEY'],
        fullName: data['USR$FULLNAME'],
        ...(type === UserType.CRM ? { userName: data['USR$USERNAME'] } : {}),
        email: data['USR$EMAIL'],
        phone: data['USR$PHONE'],
        isAdmin: data['USR$ISADMIN'] === 1
      };
    }));

    return users;
  } finally {
    releaseReadTransaction();
  }
};

const findOne: FindOneHandler<ITicketUser> = async (sessionID, clause = {}) => {
  const filter = await find(sessionID, clause);

  if (filter.length === 0) {
    return Promise.resolve(undefined);
  }

  return filter[0];
};

const update: UpdateHandler<IFilter> = async (
  sessionID,
  id,
  metadata
) => {
  const { fetchAsSingletonObject, releaseTransaction, string2Blob } = await startTransaction(sessionID);

  try {
    const ID = id;

    const {
      filters,
      entityName
    } = metadata;

    const updatedFilter = await fetchAsSingletonObject<IFilter>(
      `UPDATE USR$CRM_USER
      SET
        USR$ENTITYNAME = :ENTITYNAME,
        USR$FILTERS = :FILTERS
      WHERE
        ID = :ID
      RETURNING ID`,
      {
        ID,
        ENTITYNAME: entityName,
        FILTERS: await string2Blob(JSON.stringify(filters)),
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

  const { company, password, fullName, userName, email, phone } = metadata;

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
        ISADMIN: isAdmin ?? false,
        ONE_TIME_PASSWORD: isAdmin ?? false
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
    const deletedFilter = await fetchAsSingletonObject<{ ID: number; }>(
      `DELETE FROM USR$CRM_USER WHERE ID = :id
      RETURNING ID`,
      { id }
    );

    await releaseTransaction();

    return !!deletedFilter.ID;
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
