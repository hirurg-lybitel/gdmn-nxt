import { ICRMTicketUser, ILabel, ticketStateCodes, UserType } from './../../../../../../../libs/util-api-types/src/lib/crmDataTypes';
import { acquireReadTransaction, startTransaction } from '@gdmn-nxt/db-connection';
import { customersService } from '@gdmn-nxt/modules/customers/service';
import { ticketsStateRepository } from '@gdmn-nxt/modules/tickets-state/repository';
import { FindHandler, FindOneHandler, ITicket, SaveHandler, UpdateHandler } from '@gsbelarus/util-api-types';
import { bin2String, prepareClause } from '@gsbelarus/util-helpers';
import { getStringFromBlob } from 'libs/db-connection/src/lib/convertors';

const find: FindHandler<ITicket> = async (
  sessionID,
  clause = {},
  _
) => {
  const { fetchAsObject, releaseReadTransaction, attachment, transaction } = await acquireReadTransaction(sessionID);

  try {
    const { clauseString, whereClause } = prepareClause(clause, { prefix: () => 't' });

    const sql = `
      SELECT
        t.ID,
        t.USR$TITLE,
        t.USR$COMPANYKEY,
        t.USR$USERKEY,
        t.USR$OPENAT,
        t.USR$CLOSEAT,
        t.USR$NEEDCALL,
        t.USR$DEADLINE,

        s.ID as STATEID,
        s.USR$NAME as STATE_NAME,
        s.USR$CODE as STATE_CODE,

        u.ID as USER_ID,
        u.USR$FULLNAME as USER_NAME,
        u.USR$PHONE as USER_PHONE,
        u.USR$EMAIL as USER_EMAIL,
        ps.USR$AVATAR,

        cgu.ID as CLOSER_ID,
        cgc.NAME AS CLOSER_FULLNAME,
        cgc.EMAIL as CLOSER_EMAIL,
        cgc.PHONE as CLOSER_PHONE,
        cgups.USR$AVATAR as CLOSER_AVATAR_BLOB,

        sendergu.ID as CRM_SENDER_ID,
        sendergc.NAME as CRM_SENDER_FULLNAME,
        sendergc.EMAIL as CRM_SENDER_EMAIL,
        sendergc.PHONE as CRM_SENDER_PHONE,
        sendergups.USR$AVATAR as CRM_SENDER_AVATAR_BLOB
      FROM USR$CRM_TICKET t
        LEFT JOIN USR$CRM_TICKET_STATE s ON s.ID = t.USR$STATE

        /* Отправитель(Пользователь тикет системы) */
        LEFT JOIN USR$CRM_USER u ON u.ID = t.USR$USERKEY
        LEFT JOIN USR$CRM_T_USER_PROFILE_SETTINGS ps ON ps.USR$USERKEY = t.USR$USERKEY

        /* Кем закрыт */
        LEFT JOIN GD_USER cgu ON cgu.ID = USR$CLOSEDBY
        LEFT JOIN USR$CRM_PROFILE_SETTINGS cgups ON cgups.USR$USERKEY = cgu.ID
        LEFT JOIN GD_CONTACT cgc ON cgc.id = cgu.contactkey

        /* Отправитель(Пользователь CRM) */
        LEFT JOIN GD_USER sendergu ON sendergu.ID = t.USR$CRM_USERKEY
        LEFT JOIN USR$CRM_PROFILE_SETTINGS sendergups ON sendergups.USR$USERKEY = sendergu.ID
        LEFT JOIN GD_CONTACT sendergc ON sendergc.id = sendergu.contactkey
      ${clauseString.length > 0 ? ` WHERE ${clauseString}` : ''}
      ORDER BY COALESCE(USR$CLOSEAT, USR$OPENAT) DESC`;

    const result = await fetchAsObject<any>(sql, whereClause);

    const customers = await customersService.find(sessionID, { ticketSystem: 'true' });

    let sortedCustomers = {};

    for (const customer of customers) {
      sortedCustomers = { ...sortedCustomers, [customer.ID]: customer };
    }

    const labelsData = await fetchAsObject(`
      SELECT
        l.ID,
        l.USR$NAME,
        l.USR$COLOR,
        l.USR$ICON,
        l.USR$DESCRIPTION,
        tl.USR$TICKETKEY
      FROM USR$CRM_TICKET_LABELS tl
        JOIN USR$CRM_T_LABELS l on l.ID = tl.USR$LABELKEY
      ORDER BY tl.USR$TICKETKEY`);

    const labels = new Map();
    labelsData.forEach(label => {
      if (labels[label['USR$TICKETKEY']]) {
        labels[label['USR$TICKETKEY']].push({ ...label });
      } else {
        labels[label['USR$TICKETKEY']] = [{ ...label }];
      };
    });

    const getAvatar = async (data) => {
      const NULL_AVATAR_CHAR = '\u0000';
      if (!data) return undefined;
      const avatarBlob = await getStringFromBlob(attachment, transaction, data);
      const avatar = bin2String(avatarBlob.split(','));
      if (avatar === NULL_AVATAR_CHAR) return undefined;
      return avatar;
    };

    const performersData = await fetchAsObject(`
      SELECT
        p.USR$TICKETKEY,
        gu.ID as PERFORMER_ID,
        gc.NAME AS PERFORMER_FULLNAME,
        gc.EMAIL as PERFORMER_EMAIL,
        gc.PHONE as PERFORMER_PHONE,
        gups.USR$AVATAR as PERFORMER_AVATAR_BLOB
      FROM USR$CRM_TICKET_PERFORMERS p
        LEFT JOIN GD_USER gu ON gu.ID = p.USR$PERFORMERKEY
        LEFT JOIN USR$CRM_PROFILE_SETTINGS gups ON gups.USR$USERKEY = gu.ID
        LEFT JOIN GD_CONTACT gc ON gc.id = gu.contactkey
      ORDER BY p.USR$TICKETKEY`);

    const performers: { [key: string]: ICRMTicketUser[]; } = {};
    await Promise.all(performersData.map(async (item) => {
      const performerAvatar = await getAvatar(item['PERFORMER_AVATAR_BLOB']);

      const performer = {
        ID: item['PERFORMER_ID'],
        fullName: item['PERFORMER_FULLNAME'],
        phone: item['PERFORMER_PHONE'],
        email: item['PERFORMER_EMAIL'],
        avatar: performerAvatar
      };

      if (performers[item['USR$TICKETKEY']]) {
        performers[item['USR$TICKETKEY']].push({ ...performer });
      } else {
        performers[item['USR$TICKETKEY']] = [{ ...performer }];
      };
    }));


    const tickets: ITicket[] = await Promise.all(result.map(async (data) => {
      const avatar = await getAvatar(data['USR$AVATAR']);
      const closerAvatar = await getAvatar(data['CLOSER_AVATAR_BLOB']);
      const CRMSenderAvatar = await getAvatar(data['CRM_SENDER_AVATAR_BLOB']);

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
        ...(data['USER_ID'] ? {
          sender: {
            ID: data['USER_ID'],
            fullName: data['USER_NAME'],
            phone: data['USER_PHONE'],
            email: data['USER_EMAIL'],
            avatar,
            type: UserType.Tickets
          }
        } : {
          sender: {
            ID: data['CRM_SENDER_ID'],
            fullName: data['CRM_SENDER_FULLNAME'],
            phone: data['CRM_SENDER_PHONE'],
            email: data['CRM_SENDER_EMAIL'],
            avatar: CRMSenderAvatar,
            type: UserType.Gedemin
          }
        }),
        performers: performers[data['ID']],
        closeBy: data['CLOSER_ID'] ? {
          ID: data['CLOSER_ID'],
          fullName: data['CLOSER_FULLNAME'],
          phone: data['CLOSER_PHONE'],
          email: data['CLOSER_EMAIL'],
          avatar: closerAvatar
        } : undefined,
        needCall: data['USR$NEEDCALL'] === 1,
        labels: labels[data['ID']],
        deadline: data['USR$DEADLINE'] ? new Date(data['USR$DEADLINE']) : undefined
      };
    }));

    return tickets;
  } finally {
    releaseReadTransaction();
  }
};

const findOne: FindOneHandler<ITicket> = async (sessionID, clause = {}) => {
  const ticket = await find(sessionID, clause, undefined);

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

  const { title, company, userId, openAt, performers, labels, deadline } = metadata;

  const ticketStates = await ticketsStateRepository.find(sessionID);

  const currentState = ticketStates.find(state => state.code === ((performers && performers.length > 0) ? ticketStateCodes.assigned : ticketStateCodes.initial));

  if (!currentState?.ID) {
    throw new Error('Не удалось определить статус тикета');
  }

  const senderField = type === UserType.Tickets ? 'USR$USERKEY' : 'USR$CRM_USERKEY';

  try {
    const now = new Date();
    const defaultDeadline = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

    const ticket = await fetchAsSingletonObject<ITicketSave>(
      `INSERT INTO USR$CRM_TICKET(USR$TITLE, USR$COMPANYKEY, ${senderField}, USR$OPENAT, USR$STATE, USR$DEADLINE)
      VALUES(:TITLE,:COMPANYKEY,:USERKEY,:OPENAT,:STATEID,:DEADLINE)
      RETURNING ID`,
      {
        TITLE: title,
        COMPANYKEY: company.ID,
        USERKEY: userId,
        OPENAT: openAt ? new Date(openAt) : new Date(),
        STATEID: currentState.ID,
        DEADLINE: deadline ? new Date(deadline) : defaultDeadline
      }
    );

    await Promise.all(performers?.map(async (performer) => {
      return await fetchAsSingletonObject<ILabel>(
        `INSERT INTO USR$CRM_TICKET_PERFORMERS(USR$TICKETKEY, USR$PERFORMERKEY)
          VALUES(:TICKETKEY, :PERFORMERKEY)
          RETURNING ID
        `,
        {
          TICKETKEY: ticket.ID,
          PERFORMERKEY: performer.ID
        }
      );
    }));

    await Promise.all(labels.map(async (label) => {
      return await fetchAsSingletonObject<ILabel>(
        `INSERT INTO USR$CRM_TICKET_LABELS(USR$TICKETKEY, USR$LABELKEY)
          VALUES(:TICKETKEY, :LABELKEY)
          RETURNING ID
        `,
        {
          TICKETKEY: ticket.ID,
          LABELKEY: label.ID
        }
      );
    }));

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
  const { fetchAsSingletonObject, releaseTransaction, executeQuery } = await startTransaction(sessionID);

  try {
    const ID = id;

    const {
      title,
      closeAt,
      needCall,
      state,
      performers,
      closeBy,
      labels
    } = metadata;

    const ticketsUserField = `
        USR$TITLE = :TITLE,
        USR$NEEDCALL = :NEEDCALL,
        USR$STATE = :STATE,
        USR$CLOSEAT = :CLOSEAT
      `;

    const gedeminUserFields = `
      USR$TITLE = :TITLE,
      USR$NEEDCALL = :NEEDCALL,
      USR$CLOSEAT = :CLOSEAT,
      USR$STATE = :STATE,
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
        CLOSEDBY: closeBy?.ID
      }
    );

    const deletePerformers = await executeQuery(
      'DELETE FROM USR$CRM_TICKET_PERFORMERS WHERE USR$TICKETKEY = :TICKETKEY',
      {
        TICKETKEY: ID
      }
    );
    deletePerformers.close();

    if (performers) {
      await Promise.all(performers.map(async (performer) => {
        return await fetchAsSingletonObject<ILabel>(
          `INSERT INTO USR$CRM_TICKET_PERFORMERS(USR$TICKETKEY, USR$PERFORMERKEY)
          VALUES(:TICKETKEY, :PERFORMERKEY)
          RETURNING ID
        `,
          {
            TICKETKEY: ID,
            PERFORMERKEY: performer.ID
          }
        );
      }));
    }

    const deleteLabels = await executeQuery(
      'DELETE FROM USR$CRM_TICKET_LABELS WHERE USR$TICKETKEY = :TICKETKEY',
      {
        TICKETKEY: ID
      }
    );
    deleteLabels.close();

    if (labels) {
      await Promise.all(labels.map(async (label) => {
        return await fetchAsSingletonObject<ILabel>(
          `INSERT INTO USR$CRM_TICKET_LABELS(USR$TICKETKEY, USR$LABELKEY)
          VALUES(:TICKETKEY, :LABELKEY)
          RETURNING ID
        `,
          {
            TICKETKEY: ID,
            LABELKEY: label.ID
          }
        );
      }));
    }

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
