import { startTransaction } from '@gdmn-nxt/db-connection';
import { NotificationAction } from '@gdmn-nxt/socket';
import { UserType } from '@gsbelarus/util-api-types';

export interface IinsertNotificationParams {
  sessionId: string,
  message: string,
  userIDs: number[],
  title?: string,
  onDate?: Date,
  actionContent?: string,
  actionType?: NotificationAction,
  type?: UserType;
}

export const insertNotification = async (params: IinsertNotificationParams) => {
  const { sessionId, message, userIDs, title, onDate, type = UserType.Gedemin, actionContent, actionType } = params;
  const { fetchAsObject, releaseTransaction } = await startTransaction(sessionId);

  const notificationTable = type === UserType.Tickets ? 'USR$CRM_T_NOTIFICATIONS' : 'USR$CRM_NOTIFICATIONS';

  try {
    const sql = `
      INSERT INTO ${notificationTable} (USR$USERKEY, USR$TITLE, USR$MESSAGE, USR$ONDATE, USR$ACTIONCONTENT, USR$ACTIONTYPE)
      VALUES(:userId, :TITLE, :message, :ONDATE, :ACTIONCONTENT, :ACTIONTYPE)
      RETURNING ID`;

    await Promise.all(userIDs.map(userId => fetchAsObject(sql, {
      userId,
      TITLE: title ?? 'От администратора',
      message,
      ONDATE: onDate ?? new Date(),
      ACTIONCONTENT: actionContent,
      ACTIONTYPE: actionType.toString()
    })));

    await releaseTransaction();
  } catch (error) {
    await releaseTransaction(false);
    throw new Error(error.message);
  };
};
