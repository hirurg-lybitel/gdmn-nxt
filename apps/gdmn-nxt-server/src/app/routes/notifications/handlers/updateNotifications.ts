import { resultError } from '../../../responseMessages';
import { releaseTransaction, startTransaction } from '../../../utils/db-connection';

export const updateNotifications = async (sessionId: string) => {
  const { attachment, transaction } = await startTransaction(sessionId);

  try {
    const sql = `
      EXECUTE BLOCK
      AS
        DECLARE VARIABLE CONTACTKEY TYPE OF COLUMN GD_CONTACT.ID;
        DECLARE VARIABLE MESSAGE TYPE OF COLUMN USR$CRM_NOTIFICATIONS.USR$MESSAGE;
        DECLARE VARIABLE DEAL_ID TYPE OF COLUMN USR$CRM_DEALS.ID;
        DECLARE VARIABLE DEAL_CREATIONDATE TYPE OF COLUMN USR$CRM_DEALS.USR$CREATIONDATE;
        DECLARE VARIABLE DEAL_DEADLINE TYPE OF COLUMN USR$CRM_DEALS.USR$DEADLINE;
        DECLARE VARIABLE DEAL_NUMBER TYPE OF COLUMN USR$CRM_DEALS.USR$NUMBER;
        DECLARE VARIABLE DEAL_NAME TYPE OF COLUMN USR$CRM_DEALS.USR$NAME;
        DECLARE DAYS_FOR_WITHOUT_DEADLINE SMALLINT = 10;
        DECLARE TIME_FOR_DELETE_DELAYED SMALLINT = 60;
        DECLARE USERKEY TYPE OF COLUMN GD_USER.ID;
      BEGIN
        /** Удалить все просроченные помеченные на удаление уведомления всех пользователей*/
        DELETE FROM USR$CRM_NOTIFICATIONS
        WHERE
          USR$DELAYED = 1
          AND DATEDIFF(MINUTE FROM EDITIONDATE TO CURRENT_TIMESTAMP) >= :TIME_FOR_DELETE_DELAYED;

        FOR SELECT ID, CONTACTKEY
        FROM GD_USER
        WHERE
          DISABLED = 0
        INTO :USERKEY, :CONTACTKEY
        DO
        BEGIN
          /** Создать уведомления по сделкам данного пользователя*/
          FOR SELECT d.ID, d.USR$NUMBER, d.USR$NAME, D.USR$CREATIONDATE, d.USR$DEADLINE
          FROM USR$CRM_DEALS d
          WHERE
            :CONTACTKEY IN (d.USR$CREATORKEY, d.USR$PERFORMER)
            AND d.USR$DONE = 0 AND d.USR$DENIED = 0
          ORDER BY d.USR$NUMBER
          INTO :DEAL_ID, :DEAL_NUMBER, :DEAL_NAME, :DEAL_CREATIONDATE, :DEAL_DEADLINE
          DO
          BEGIN
            MESSAGE = CASE
            WHEN (DEAL_DEADLINE IS NOT NULL AND DATEDIFF(DAY FROM CURRENT_DATE TO DEAL_DEADLINE) < 0) THEN
              'Сделка №' || DEAL_NUMBER || ' **' || DEAL_NAME || '** просрочена на **' || ABS(DATEDIFF(DAY FROM CURRENT_DATE TO DEAL_DEADLINE)) || ' дней**'
            WHEN (DEAL_DEADLINE IS NOT NULL AND DATEDIFF(DAY FROM CURRENT_DATE TO DEAL_DEADLINE) = 0) THEN
              '**Сегодня истекает** срок закрытия сделки №' || DEAL_NUMBER || ' **' || DEAL_NAME || '**'
            WHEN (DEAL_DEADLINE IS NOT NULL AND DATEDIFF(DAY FROM CURRENT_DATE TO DEAL_DEADLINE) = 1) THEN
              'Остался **1 день** до окончания срока закрытия сделки №' || DEAL_NUMBER || ' **' || DEAL_NAME || '**'
            WHEN (DEAL_DEADLINE IS NULL AND DATEDIFF(DAY FROM DEAL_CREATIONDATE TO CURRENT_DATE) >= DAYS_FOR_WITHOUT_DEADLINE) THEN
              'Сделка №' || DEAL_NUMBER || ' **' || DEAL_NAME || '**' || ' не закрыта уже **' || DATEDIFF(DAY FROM CURRENT_DATE TO DEAL_CREATIONDATE) || ' дней**'
            ELSE ''
            END;

            IF (MESSAGE != '') THEN
              UPDATE OR INSERT INTO USR$CRM_NOTIFICATIONS(USR$USERKEY, USR$TITLE, USR$MESSAGE, USR$KEY)
              VALUES(:USERKEY, 'Напоминание', :MESSAGE, :DEAL_ID)
              MATCHING(USR$USERKEY, USR$KEY);
          END
        END
      END`;

    await attachment.executeQuery(transaction, sql);
  } catch (error) {
    console.error(resultError(error.message));
  } finally {
    releaseTransaction(sessionId, transaction);
  };
};
