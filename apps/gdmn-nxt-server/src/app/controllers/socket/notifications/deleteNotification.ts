import { startTransaction } from '@gdmn-nxt/db-connection';
import { UserType } from '@gsbelarus/util-api-types';

export const deleteNotification = async (sessionId: string, id: number, userType?: UserType) => {
  if (isNaN(id)) return;
  const { releaseTransaction, executeQuery } = await startTransaction(sessionId);

  const notificationsTable = userType === UserType.Tickets ? 'USR$CRM_T_NOTIFICATIONS' : 'USR$CRM_NOTIFICATIONS';

  try {
    const sql = `
      UPDATE ${notificationsTable} c
      SET c.USR$DELAYED = 1
      WHERE c.ID = ${id}`;

    const result = await executeQuery(sql);
    result.close();

    await releaseTransaction();
  } catch (error) {
    console.error('[ deleteNotification ]', error.message);
    await releaseTransaction(false);
  };
};
