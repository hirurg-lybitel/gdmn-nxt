import { acquireReadTransaction, startTransaction } from '@gdmn-nxt/db-connection';
import { FindHandler, FindOneHandler, FindOperator, ITicket, SaveHandler, UpdateHandler } from '@gsbelarus/util-api-types';
import { bin2String } from '@gsbelarus/util-helpers';
import { getStringFromBlob } from 'libs/db-connection/src/lib/convertors';

const find: FindHandler<ITicket> = async (
  sessionID,
  clause = {},
  _,
  type
) => {
  const { fetchAsObject, releaseReadTransaction, attachment, transaction } = await acquireReadTransaction(sessionID);

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
            case 'IsNull':
              return `${f} IS NULL`;
            case 'IsNotNull':
              return `${f} IS NOT NULL`;
          }
        }
        params.push(clause[f]);
        return `t.${f} = ?`;
      })
      .join(' AND ');

    const sql = `
      SELECT
        t.ID,
        t.USR$TITLE,
        t.USR$COMPANYKEY,
        t.USR$USERKEY,
        t.USR$OPENAT,
        t.USR$CLOSEAT,
        s.ID as STATEID,
        s.USR$NAME as STATE_NAME,
        s.USR$CODE as STATE_CODE,
        u.ID as USER_ID,
        u.USR$FULLNAME as USER_NAME,
        u.USR$PHONE as USER_PHONE,
        u.USR$EMAIL as USER_EMAIL,
        ps.USR$AVATAR
      FROM USR$CRM_TICKET t
        JOIN USR$CRM_TICKET_STATE s ON s.ID = t.USR$STATE
        JOIN USR$CRM_USER u ON u.ID = t.USR$USERKEY
        JOIN USR$CRM_T_USER_PROFILE_SETTINGS ps ON ps.USR$USERKEY = t.USR$USERKEY
      ${clauseString.length > 0 ? ` WHERE ${clauseString}` : ''}`;

    const result = await fetchAsObject<any>(sql, params);

    const tickets: ITicket[] = await Promise.all(result.map(async (data) => {
      const avatarBlob = await getStringFromBlob(attachment, transaction, data['USR$AVATAR']);
      const avatar = bin2String(avatarBlob.split(','));

      return {
        ID: data['ID'],
        title: data['USR$TITLE'],
        companyKey: data['USR$COMPANYKEY'],
        openAt: data['USR$OPENAT'],
        closeAt: data['USR$CLOSEAT'],
        state: {
          ID: data['STATEID'],
          name: data['STATE_NAME'],
          code: data['STATE_CODE']
        },
        sender: {
          id: data['USER_ID'],
          fullName: data['USER_NAME'],
          phone: data['USER_PHONE'],
          email: data['USER_EMAIL'],
          avatar
        }
      };
    }));

    return tickets;
  } finally {
    releaseReadTransaction();
  }
};

const findOne: FindOneHandler<ITicket> = async (sessionID, clause = {}, type) => {
  const ticket = await find(sessionID, clause, undefined, type);

  if (ticket.length === 0) {
    return Promise.resolve(undefined);
  }

  return ticket[0];
};

interface ITicketSave extends ITicket {
  userId: number;
}

const save: SaveHandler<ITicketSave> = async (
  sessionID,
  metadata,
  type
) => {
  const { fetchAsSingletonObject, releaseTransaction } = await startTransaction(sessionID);

  const { title, companyKey, userId, openAt } = metadata;

  try {
    const ticket = await fetchAsSingletonObject<ITicketSave>(
      `INSERT INTO USR$CRM_TICKET(USR$TITLE,USR$COMPANYKEY,USR$USERKEY,USR$OPENAT)
      VALUES(:TITLE,:COMPANYKEY,:USERKEY,:OPENAT)
      RETURNING ID`,
      {
        TITLE: title,
        COMPANYKEY: companyKey,
        USERKEY: userId,
        OPENAT: new Date(openAt)
      }
    );

    await releaseTransaction();

    return ticket;
  } catch (error) {
    await releaseTransaction(false);
    throw new Error(error);
  }
};

const update: UpdateHandler<ITicket> = async (
  sessionID,
  id,
  metadata,
  type
) => {
  const { fetchAsSingletonObject, releaseTransaction } = await startTransaction(sessionID);

  try {
    const ID = id;

    const {
      title,
      openAt
    } = metadata;

    const updatedTicket = await fetchAsSingletonObject<ITicket>(
      `UPDATE USR$CRM_TICKET
        SET
          USR$TITLE = :TITLE,
          USR$OPENAT = :OPENAT
        WHERE
          ID = :ID
        RETURNING ID`,
      {
        TITLE: title,
        OPENAT: new Date(openAt),
        ID
      }
    );

    await releaseTransaction();

    return updatedTicket;
  } catch (error) {
    await releaseTransaction(false);
    throw new Error(error);
  }
};

export const ticketsRepository = {
  find,
  findOne,
  update,
  save
};
