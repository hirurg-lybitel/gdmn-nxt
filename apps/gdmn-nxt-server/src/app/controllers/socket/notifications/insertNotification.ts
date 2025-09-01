import { startTransaction } from '@gdmn-nxt/db-connection';
import { UserType } from '@gsbelarus/util-api-types';

interface IinsertNotificationParams {
  sessionId: string,
  title?: string,
  message: string,
  onDate?: Date,
  actionContent?: string,
  actionType?: string,
  userIDs: number[];
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
      ACTIONTYPE: actionType
    })));

    await releaseTransaction();
  } catch (error) {
    await releaseTransaction(false);
    throw new Error(error.message);
  };
};
