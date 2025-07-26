import { acquireReadTransaction, startTransaction } from '@gdmn-nxt/db-connection';
import { FindHandler, FindOneHandler, FindOperator, ITicketMessage, SaveHandler, UserType } from '@gsbelarus/util-api-types';
import { bin2String } from '@gsbelarus/util-helpers';
import { getStringFromBlob } from 'libs/db-connection/src/lib/convertors';

const find: FindHandler<ITicketMessage> = async (
  sessionID,
  clause = {},
) => {
  const { fetchAsObject, releaseReadTransaction, attachment, transaction, blob2String } = await acquireReadTransaction(sessionID);

  try {
    const params = [];
    const clauseString = Object
      .keys({ ...clause })
      .map(r => {
        if (typeof clause[r] === 'object' && 'operator' in clause[r]) {
          const expression = clause[r] as FindOperator;
          switch (expression.operator) {
            case 'LIKE':
              return ` UPPER(r.${r}) ${expression.value} `;
          }
        }
        params.push(clause[r]);
        return ` r.${r} = ?`;
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
        CASE
          WHEN r.USR$CUSTOMER_AUTHORKEY IS NOT NULL THEN 'user'
          ELSE 'empl'
        END AS TYPE,
        r.ID,
        r.USR$BODY,
        r.USR$STATE,
        r.USR$TICKETKEY,
        s.ID as STATEID,
        s.USR$NAME as STATE_NAME,
        s.USR$CODE as STATE_CODE
      FROM USR$CRM_TICKETREC r
        LEFT JOIN USR$CRM_USER CUSTOMER ON CUSTOMER.ID = r.USR$CUSTOMER_AUTHORKEY
        LEFT JOIN USR$CRM_T_USER_PROFILE_SETTINGS cps ON cps.USR$USERKEY = CUSTOMER.ID

        LEFT JOIN GD_USER SUPPORT ON SUPPORT.ID = r.USR$SUPPORT_AUTHORKEY
        LEFT JOIN GD_CONTACT c ON c.ID = SUPPORT.CONTACTKEY
        LEFT JOIN USR$CRM_PROFILE_SETTINGS sps ON sps.USR$USERKEY = SUPPORT.ID

        LEFT JOIN USR$CRM_TICKET_STATE s ON s.ID = r.USR$STATE
      ${clauseString.length > 0 ? ` WHERE ${clauseString}` : ''}`;

    const result = await fetchAsObject<any>(sql, params);

    const messages: ITicketMessage[] = await Promise.all(result.map(async (data) => {
      const avatarBlob = await getStringFromBlob(attachment, transaction, data['AVATAR']);
      const avatar = bin2String(avatarBlob.split(','));


      return {
        ID: data['ID'],
        body: await blob2String(data['USR$BODY']),
        ticketKey: data['USR$TICKETKEY'],
        user: {
          ID: data['USERID'],
          type: data['TYPE'],
          fullName: data['NAME'],
          phone: data['PHONE'],
          email: data['EMAIL'],
          avatar: avatar
        },
        state: {
          ID: data['STATEID'],
          name: data['STATE_NAME'],
          code: data['STATE_CODE']
        }
      };
    }));

    return messages;
  } finally {
    releaseReadTransaction();
  }
};

const findOne: FindOneHandler<ITicketMessage> = async (sessionID, clause = {}) => {
  const message = await find(sessionID, clause);

  if (message.length === 0) {
    return Promise.resolve(undefined);
  }

  return message[0];
};

interface ITicketMessageSave extends Omit<ITicketMessage, 'user'> {
  userId: number;
}

const save: SaveHandler<ITicketMessageSave> = async (
  sessionID,
  metadata,
  type
) => {
  const { fetchAsSingletonObject, releaseTransaction, string2Blob } = await startTransaction(sessionID);

  const { ticketKey, body, state, userId } = metadata;

  const fieldName = type === UserType.Tickets ? 'USR$CUSTOMER_AUTHORKEY' : 'USR$SUPPORT_AUTHORKEY';

  const blobBody = await string2Blob(body);

  try {
    const message = await fetchAsSingletonObject<ITicketMessageSave>(
      `INSERT INTO USR$CRM_TICKETREC(USR$TICKETKEY, USR$BODY, USR$STATE, ${fieldName})
      VALUES(:TICKETKEY, :BODY, :STATE, :SENDER)
      RETURNING ID`,
      {
        TICKETKEY: ticketKey,
        BODY: blobBody,
        STATE: state.ID,
        SENDER: userId
      }
    );

    await releaseTransaction();

    return message;
  } catch (error) {
    await releaseTransaction(false);
    throw new Error(error);
  }
};

export const ticketsMessagesRepository = {
  find,
  findOne,
  save
};
