import { acquireReadTransaction, startTransaction } from '@gdmn-nxt/db-connection';
import { FindHandler, FindOneHandler, FindOperator, ITicketHistory, ITicketState, SaveHandler, UserType } from '@gsbelarus/util-api-types';
import { bin2String } from '@gsbelarus/util-helpers';
import { getStringFromBlob } from 'libs/db-connection/src/lib/convertors';

const find: FindHandler<ITicketHistory> = async (
  sessionID,
  clause = {}
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
              return ` UPPER(th.${f}) ${expression.value} `;
            case 'IsNull':
              return `${f} IS NULL`;
            case 'IsNotNull':
              return `${f} IS NOT NULL`;
          }
        }
        params.push(clause[f]);
        return `th.${f} = ?`;
      })
      .join(' AND ');

    const sql = `
      SELECT
        COALESCE(
          CUSTOMER.ID,
          SUPPORT.ID
        ) AS USERID,
        COALESCE(
          CUSTOMER.USR$FULLNAME,
          c.NAME
        ) AS NAME,
        COALESCE(
          CUSTOMER.USR$EMAIL,
          c.EMAIL
        ) AS EMAIL,
        COALESCE(
          CUSTOMER.USR$PHONE,
          c.PHONE
        ) AS PHONE,
        COALESCE(
          cps.USR$AVATAR,
          sps.USR$AVATAR
        ) AS AVATAR,

        PERFORMER.ID AS PERFORMER_ID,
        performerc.NAME AS PERFORMER_NAME,
        performerc.EMAIL AS PERFORMER_EMAIL,
        performerc.PHONE AS PERFORMER_PHONE,
        spsp.USR$AVATAR AS PERFORMER_AVATAR,

        th.ID,
        th.USR$TICKETKEY,
        th.USR$CHANGEAT,
        s.ID as STATEID,
        s.USR$NAME as STATE_NAME,
        s.USR$CODE as STATE_CODE
      FROM USR$CRM_TICKET_HISTORY th
        LEFT JOIN USR$CRM_USER CUSTOMER ON CUSTOMER.ID = th.USR$CUSTOMER
        LEFT JOIN USR$CRM_T_USER_PROFILE_SETTINGS cps ON cps.USR$USERKEY = CUSTOMER.ID

        LEFT JOIN GD_USER SUPPORT ON SUPPORT.ID = th.USR$SUPPORT
        LEFT JOIN GD_CONTACT c ON c.ID = SUPPORT.CONTACTKEY
        LEFT JOIN USR$CRM_PROFILE_SETTINGS sps ON sps.USR$USERKEY = SUPPORT.ID

        LEFT JOIN GD_USER PERFORMER ON PERFORMER.ID = th.USR$PERFORMER
        LEFT JOIN GD_CONTACT performerc ON performerc.ID = PERFORMER.CONTACTKEY
        LEFT JOIN USR$CRM_PROFILE_SETTINGS spsp ON spsp.USR$USERKEY = PERFORMER.ID

        LEFT JOIN USR$CRM_TICKET_STATE s ON s.ID = th.USR$STATE
      ${clauseString.length > 0 ? ` WHERE ${clauseString}` : ''}
      ORDER BY USR$CHANGEAT`;

    const result = await fetchAsObject<any>(sql, params);

    const ticketsHistory: ITicketHistory[] = await Promise.all(result.map(async (data) => {
      const avatarBlob = await getStringFromBlob(attachment, transaction, data['AVATAR']);
      const avatar = bin2String(avatarBlob.split(','));

      const perforemrAvatarBlob = await getStringFromBlob(attachment, transaction, data['PERFORMER_AVATAR']);
      const perforemrAvatar = bin2String(perforemrAvatarBlob.split(','));

      return {
        ID: data['ID'],
        ticketKey: data['USR$TICKETKEY'],
        ...(data['USERID'] ? {
          user: {
            ID: data['USERID'],
            fullName: data['NAME'],
            phone: data['PHONE'],
            email: data['EMAIL'],
            avatar: avatar
          }
        } : {}),
        changeAt: data['USR$CHANGEAT'],
        state: {
          ID: data['STATEID'],
          name: data['STATE_NAME'],
          code: data['STATE_CODE']
        },
        ...(data['PERFORMER_ID'] ? {
          performer: {
            ID: data['PERFORMER_ID'],
            fullName: data['PERFORMER_NAME'],
            phone: data['PERFORMER_PHONE'],
            email: data['PERFORMER_EMAIL'],
            avatar: perforemrAvatar
          }
        } : {})
      };
    }));

    return ticketsHistory;
  } finally {
    releaseReadTransaction();
  }
};

const findOne: FindOneHandler<ITicketHistory> = async (sessionID, clause = {}) => {
  const ticketHistory = await find(sessionID, clause, undefined);

  if (ticketHistory.length === 0) {
    return Promise.resolve(undefined);
  }

  return ticketHistory[0];
};

interface IITicketHistorySave extends Omit<ITicketHistory, 'user'> {
  userId?: number;
}

const save: SaveHandler<IITicketHistorySave> = async (
  sessionID,
  metadata,
  type
) => {
  const { fetchAsSingletonObject, releaseTransaction } = await startTransaction(sessionID);

  const { ticketKey, userId, state, changeAt, performer } = metadata;

  const fieldName = type === UserType.Tickets ? 'USR$CUSTOMER' : 'USR$SUPPORT';

  try {
    const message = await fetchAsSingletonObject<IITicketHistorySave>(
      `INSERT INTO USR$CRM_TICKET_HISTORY(USR$TICKETKEY, USR$CHANGEAT, USR$STATE, ${fieldName}, USR$PERFORMER)
      VALUES(:TICKETKEY, :CHANGEAT, :STATE, :SENDER, :PERFORMER)
      RETURNING ID`,
      {
        TICKETKEY: ticketKey,
        CHANGEAT: changeAt ? new Date(changeAt) : new Date(),
        STATE: state?.ID,
        SENDER: userId,
        PERFORMER: performer?.ID
      }
    );

    await releaseTransaction();

    return message;
  } catch (error) {
    await releaseTransaction(false);
    throw new Error(error);
  }
};

export const ticketsHistoryRepository = {
  find,
  findOne,
  save
};
