import { UserType } from './../../../../../../../libs/util-api-types/src/lib/crmDataTypes';
import { acquireReadTransaction, startTransaction } from '@gdmn-nxt/db-connection';
import { customersService } from '@gdmn-nxt/modules/customers/service';
import { ticketsStateRepository } from '@gdmn-nxt/modules/tickets-state/repository';
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
        t.USR$NEEDCALL,

        s.ID as STATEID,
        s.USR$NAME as STATE_NAME,
        s.USR$CODE as STATE_CODE,

        u.ID as USER_ID,
        u.USR$FULLNAME as USER_NAME,
        u.USR$PHONE as USER_PHONE,
        u.USR$EMAIL as USER_EMAIL,
        ps.USR$AVATAR,

        cgu.ID as CLOSER_ID,
        REPLACE(
          TRIM(
            COALESCE(cgp.FIRSTNAME, '') || ' ' ||
            COALESCE(cgp.SURNAME, '') || ' ' ||
            COALESCE(cgp.MIDDLENAME, '')
          ),
          '  ', ' '
        ) AS CLOSER_FULLNAME,
        cgc.EMAIL as CLOSER_EMAIL,
        cgc.PHONE as CLOSER_PHONE,
        cgups.USR$AVATAR as CLOSER_AVATAR_BLOB,

        gu.ID as PERFORMER_ID,
        REPLACE(
          TRIM(
            COALESCE(gp.FIRSTNAME, '') || ' ' ||
            COALESCE(gp.SURNAME, '') || ' ' ||
            COALESCE(gp.MIDDLENAME, '')
          ),
          '  ', ' '
        ) AS PERFORMER_FULLNAME,
        gc.EMAIL as PERFORMER_EMAIL,
        gc.PHONE as PERFORMER_PHONE,
        gups.USR$AVATAR as PERFORMER_AVATAR_BLOB
      FROM USR$CRM_TICKET t
        JOIN USR$CRM_TICKET_STATE s ON s.ID = t.USR$STATE

        JOIN USR$CRM_USER u ON u.ID = t.USR$USERKEY
        JOIN USR$CRM_T_USER_PROFILE_SETTINGS ps ON ps.USR$USERKEY = t.USR$USERKEY

        LEFT JOIN GD_USER gu ON gu.ID = USR$PERFORMERKEY
        LEFT JOIN USR$CRM_PROFILE_SETTINGS gups ON gups.USR$USERKEY = gu.ID
        LEFT JOIN GD_CONTACT gc ON gc.id = gu.contactkey
        LEFT JOIN GD_PEOPLE gp ON gp.contactkey = gu.contactkey

        LEFT JOIN GD_USER cgu ON cgu.ID = USR$CLOSEDBY
        LEFT JOIN USR$CRM_PROFILE_SETTINGS cgups ON cgups.USR$USERKEY = cgu.ID
        LEFT JOIN GD_CONTACT cgc ON cgc.id = cgu.contactkey
        LEFT JOIN GD_PEOPLE cgp ON cgp.contactkey = cgu.contactkey
      ${clauseString.length > 0 ? ` WHERE ${clauseString}` : ''}`;

    const result = await fetchAsObject<any>(sql, params);

    const customers = await customersService.find(sessionID, { ticketSystem: 'true' });

    let sortedCustomers = {};

    for (const customer of customers) {
      sortedCustomers = { ...sortedCustomers, [customer.ID]: customer };
    }

    const tickets: ITicket[] = await Promise.all(result.map(async (data) => {
      const avatarBlob = await getStringFromBlob(attachment, transaction, data['USR$AVATAR']);
      const avatar = bin2String(avatarBlob.split(','));

      const performerAvatarBlob = await getStringFromBlob(attachment, transaction, data['PERFORMER_AVATAR_BLOB']);
      const performerAvatar = bin2String(performerAvatarBlob.split(','));

      const closerAvatarBlob = await getStringFromBlob(attachment, transaction, data['CLOSER_AVATAR_BLOB']);
      const closerAvatar = bin2String(closerAvatarBlob.split(','));

      return {
        ID: data['ID'],
        title: data['USR$TITLE'],
        company: sortedCustomers[data['USR$COMPANYKEY']],
        openAt: data['USR$OPENAT'],
        closeAt: data['USR$CLOSEAT'],
        state: {
          ID: data['STATEID'],
          name: data['STATE_NAME'],
          code: data['STATE_CODE']
        },
        sender: {
          ID: data['USER_ID'],
          fullName: data['USER_NAME'],
          phone: data['USER_PHONE'],
          email: data['USER_EMAIL'],
          avatar
        },
        performer: {
          ID: data['PERFORMER_ID'],
          fullName: data['PERFORMER_FULLNAME'],
          phone: data['PERFORMER_PHONE'],
          email: data['PERFORMER_EMAIL'],
          avatar: performerAvatar
        },
        closeBy: data['CLOSER_ID'] ? {
          ID: data['CLOSER_ID'],
          fullName: data['CLOSER_FULLNAME'],
          phone: data['CLOSER_PHONE'],
          email: data['CLOSER_EMAIL'],
          avatar: closerAvatar
        } : undefined,
        needCall: data['USR$NEEDCALL'] === 1
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

  const { title, company, userId, openAt, performer } = metadata;

  const ticketStates = await ticketsStateRepository.find(sessionID);

  const openState = ticketStates.find(state => state.code === 1);

  try {
    const ticket = await fetchAsSingletonObject<ITicketSave>(
      `INSERT INTO USR$CRM_TICKET(USR$TITLE,USR$COMPANYKEY,USR$USERKEY,USR$OPENAT,USR$STATE,USR$PERFORMERKEY)
      VALUES(:TITLE,:COMPANYKEY,:USERKEY,:OPENAT,:STATEID,:PERFORMERKEY)
      RETURNING ID`,
      {
        TITLE: title,
        COMPANYKEY: company.ID,
        USERKEY: userId,
        OPENAT: openAt ? new Date(openAt) : new Date(),
        STATEID: openState.ID,
        PERFORMERKEY: (!performer?.ID || performer?.ID < 0) ? undefined : performer.ID
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
      closeAt,
      needCall,
      state,
      performer,
      closeBy
    } = metadata;

    const ticketsUserField = `
        USR$TITLE = :TITLE,
        USR$NEEDCALL = :NEEDCALL
      `;

    const gedeminUserFields = `
      USR$TITLE = :TITLE,
      USR$NEEDCALL = :NEEDCALL,
      USR$CLOSEAT = :CLOSEAT,
      USR$STATE = :STATE,
      USR$PERFORMERKEY = :PERFORMERKEY,
      USR$CLOSEDBY = :CLOSEDBY
    `;

    const updatedTicket = await fetchAsSingletonObject<ITicket>(
      `UPDATE USR$CRM_TICKET
        SET
          ${type === UserType.Tickets ? ticketsUserField : gedeminUserFields}
        WHERE
          ID = :ID
        RETURNING ID`,
      {
        TITLE: title,
        NEEDCALL: needCall,
        CLOSEAT: closeAt ? new Date(closeAt) : undefined,
        ID,
        STATE: state?.ID,
        PERFORMERKEY: performer?.ID,
        CLOSEDBY: closeBy?.ID
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
