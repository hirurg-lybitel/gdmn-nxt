import { startTransaction } from '@gdmn-nxt/db-connection';

export const insertNotification = async (sessionId: string, message: string, userIDs: number[]) => {
  const { fetchAsObject, releaseTransaction } = await startTransaction(sessionId);

  try {
    const sql = `
      INSERT INTO USR$CRM_NOTIFICATIONS (USR$USERKEY, USR$TITLE, USR$MESSAGE, USR$ONDATE)
      VALUES(:userId, 'От администратора', :message, CURRENT_TIMESTAMP)
      RETURNING ID`;

    await Promise.all(userIDs.map(userId => fetchAsObject(sql, { userId, message })));

    await releaseTransaction();
  } catch (error) {
    await releaseTransaction(false);
    throw new Error(error.message);
  };
};
