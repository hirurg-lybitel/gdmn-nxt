import { startTransaction } from '@gdmn-nxt/db-connection';
import { UserType } from '@gsbelarus/util-api-types';

export const deleteAllNotifications = async (sessionId: string, userId: number, userType?: UserType) => {
  if (isNaN(userId)) return;

  const { releaseTransaction, executeQuery } = await startTransaction(sessionId);

  const notificationsTable = userType === UserType.Tickets ? 'USR$CRM_T_NOTIFICATIONS' : 'USR$CRM_NOTIFICATIONS';

  try {
    const sql = `
      UPDATE ${notificationsTable} c
      SET c.USR$DELAYED = 1
      WHERE c.USR$USERKEY = ${userId}`;

    const result = await executeQuery(sql);
    result.close();

    await releaseTransaction();
  } catch (error) {
    console.error('[ deleteAllNotification ]', error.message);
    await releaseTransaction(false);
  };
};
