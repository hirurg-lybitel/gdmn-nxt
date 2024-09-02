import { startTransaction } from '@gdmn-nxt/db-connection';

export const deleteNotification = async (sessionId: string, id: number) => {
  if (isNaN(id)) return;
  const { releaseTransaction, executeQuery } = await startTransaction(sessionId);

  try {
    const sql = `
      UPDATE USR$CRM_NOTIFICATIONS c
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
