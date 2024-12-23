import { startTransaction } from '@gdmn-nxt/db-connection';

export const deleteAllNotifications = async (sessionId: string, userId: number) => {
  if (isNaN(userId)) return;

  const { releaseTransaction, executeQuery } = await startTransaction(sessionId);

  try {
    const sql = `
      UPDATE USR$CRM_NOTIFICATIONS c
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
