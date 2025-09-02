import { acquireReadTransaction } from '@gdmn-nxt/db-connection';
import { INotification } from '@gdmn-nxt/socket';
import { IDataSchema, UserType } from '@gsbelarus/util-api-types';
import { resultError } from 'apps/gdmn-nxt-server/src/app/responseMessages';

interface IMapOfNotifications {
  [key: string]: INotification[];
};

/**
 * Get notifications list by userIds
 */
export const getNotifications = async (sessionId: string, userType?: UserType) => {
  // const { attachment, transaction } = await getReadTransaction(sessionId);
  const { releaseReadTransaction, fetchAsObject } = await acquireReadTransaction(sessionId);

  try {
    const schema: IDataSchema = {
      notifications: {
        USR$ONDATE: {
          type: 'date'
        }
      }
    };

    const execQuery = async ({ name, query, params }: { name: string, query: string, params?: any[]; }) => {
      // const rs = await attachment.executeQuery(transaction, query, params);
      try {
        // const data = await rs.fetchAsObject();
        const data = await fetchAsObject(query);
        const sch = schema[name];

        if (sch) {
          for (const rec of data) {
            for (const fld of Object.keys(rec)) {
              if ((sch[fld]?.type === 'date' || sch[fld]?.type === 'timestamp') && rec[fld] !== null) {
                rec[fld] = (rec[fld] as Date).getTime();
              }
            }
          }
        };

        return data;
      } finally {
        // await rs.close();
      }
    };

    const notificationsTable = userType === UserType.Tickets ? 'USR$CRM_T_NOTIFICATIONS' : 'USR$CRM_NOTIFICATIONS';

    const query = {
      name: 'notifications',
      query: `
        SELECT
          ID, EDITIONDATE, USR$USERKEY, USR$TITLE, USR$MESSAGE, USR$ACTIONTYPE, USR$ACTIONCONTENT, USR$ONDATE
        FROM ${notificationsTable}
        WHERE USR$DELAYED = 0
        ORDER BY USR$USERKEY, EDITIONDATE DESC`
    };

    const rawNotifications = await Promise.resolve(execQuery(query));

    const notifictions: IMapOfNotifications = {};

    rawNotifications.forEach((n: any) => {
      const newNotification: INotification = {
        id: n.ID,
        date: n.USR$ONDATE,
        title: n.USR$TITLE,
        message: n.USR$MESSAGE,
        userId: n.USR$USERKEY,
        ...(n.USR$ACTIONTYPE ? { action: n.USR$ACTIONTYPE } : {}),
        ...(n.USR$ACTIONCONTENT ? { actionContent: n.USR$ACTIONCONTENT } : {}),
      };

      if (notifictions[n.USR$USERKEY]) {
        notifictions[n.USR$USERKEY].push(newNotification);
      } else {
        notifictions[n.USR$USERKEY] = [newNotification];
      };
    });

    return notifictions;
  } catch (error) {
    console.error(resultError(error.message));
  } finally {
    await releaseReadTransaction();
  };
};
