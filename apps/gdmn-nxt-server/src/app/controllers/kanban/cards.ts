import { IChanges, IContactWithID, IDeal, IEntities, IKanbanCard, IKanbanColumn, IKanbanHistory, IRequestResult, MailAttachment } from '@gsbelarus/util-api-types';
import { RequestHandler } from 'express';
import { ResultSet } from 'node-firebird-driver-native';
import { resultError } from '../../responseMessages';
import { acquireReadTransaction, commitTransaction, getReadTransaction, releaseReadTransaction, genId, startTransaction } from '@gdmn-nxt/db-connection';
import { addHistory } from './history';
import { forEachAsync } from '@gsbelarus/util-helpers';
import { sendEmail } from '@gdmn/mailer';
import { config } from '@gdmn-nxt/config';
import { systemSettingsRepository } from '@gdmn-nxt/repositories/settings/system';
import { profileSettingsController } from '../settings/profileSettings';
import { dealFeedbackService } from '@gdmn-nxt/modules/deal-feedback/service';

const get: RequestHandler = async (req, res) => {
  const { attachment, transaction } = await getReadTransaction(req.sessionID);

  const { id } = req.params;

  if (id && isNaN(Number(id))) return res.status(422).send(resultError('Field ID is not defined or isn\'t numeric'));

  try {
    const _schema = { };

    // const erModelFull = (await importERModel('TgdcAttrUserDefinedUSR_CRM_KANBAN_COLUMNS')).entities;
    // const entites: IEntities = Object.fromEntries(Object.entries((await erModelFull).entities));

    // const allFields = [...new Set(entites['TgdcAttrUserDefinedUSR_CRM_KANBAN_COLUMNS'].attributes.map(attr => attr.name))];
    const allFields = ['ID', 'USR$INDEX', 'USR$MASTERKEY'];
    const actualFields = allFields;
    const actualFieldsNames = actualFields.join(',');
    const returnFieldsNames = allFields.join(',');

    const execQuery = async ({ name, query, params }: { name: string, query: string, params?: any[] }) => {
      const rs = await attachment.executeQuery(transaction, query, params);
      try {
        const data = await rs.fetchAsObject();
        const sch = _schema[name];

        return [name, data];
      } finally {
        await rs.close();
      }
    };

    const queries = [
      {
        name: 'cards',
        query: `
          SELECT ${actualFieldsNames}
          FROM USR$CRM_KANBAN_CARDS
          ${id ? 'WHERE ID = ?' : '' }`,
        params: id ? [id] : undefined,
      },
    ];

    const result: IRequestResult = {
      queries: {
        ...Object.fromEntries(await Promise.all(queries.map(q => execQuery(q))))
      },
      _params: id ? [{ id: id }] : undefined,
      _schema
    };

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).send(resultError(error.message));
  } finally {
    await releaseReadTransaction(req.sessionID);
  };
};

const upsert: RequestHandler = async (req, res) => {
  const {
    releaseTransaction,
    executeSingletonAsObject,
    executeSingleton,
    fetchAsObject,
    fetchAsSingletonObject,
    generateId,
    string2Blob
  } = await startTransaction(req.sessionID);

  const { id } = req.params;

  if (id && isNaN(Number(id))) return res.status(422).send(resultError('Field ID is not defined or is not numeric'));

  try {
    const isInsertMode = !id;

    const deal: IDeal = req.body['DEAL'];
    const card: IKanbanCard = { ...req.body };

    const userId = req.user['id'] || -1;

    const cardId = await (() => isInsertMode ? generateId() : Number(id))();
    const dealId = await (() => isInsertMode ? generateId() : deal.ID)();

    let paramsValues;
    let sql;

    /** Сделка не может быть исполнена, если по ней есть незавершённые задачи */
    if (deal.USR$DONE) {
      sql = `
        SELECT COUNT(task.ID)
        FROM USR$CRM_KANBAN_CARDS card
        JOIN USR$CRM_DEALS deal ON deal.ID = card.USR$DEALKEY
        JOIN USR$CRM_KANBAN_CARD_TASKS task ON task.USR$CARDKEY = card.ID
        WHERE
          card.ID = ${cardId}
          AND deal.USR$DONE = 0
          AND task.USR$CLOSED = 0`;

      const checkTasks: { COUNT: number} = await executeSingletonAsObject(sql);

      if ((checkTasks.COUNT || 0) > 0) {
        return res.status(400).send(resultError('Не может быть исполнено. Есть незакрытые задачи'));
      }
    }

    /** Формирование истории изменений */
    sql = `
      SELECT
        d.USR$AMOUNT, d.USR$CONTACTKEY, d.USR$NAME, d.USR$PERFORMER, d.USR$SECOND_PERFORMER,
        con.ID AS CONTACT_ID, con.NAME AS CONTACT_NAME,
        performer_1.ID AS PERMORMER_1_ID, performer_1.NAME AS PERMORMER_1_NAME,
        performer_2.ID AS PERMORMER_2_ID, performer_2.NAME AS PERMORMER_2_NAME,
        d.USR$PREPAID AS PREPAID, USR$DENIED DENIED, USR$DONE, USR$READYTOWORK
      FROM USR$CRM_DEALS d
        LEFT JOIN GD_CONTACT con ON con.ID = d.USR$CONTACTKEY
        LEFT JOIN GD_CONTACT performer_1 ON performer_1.ID = d.USR$PERFORMER
        LEFT JOIN GD_CONTACT performer_2 ON performer_2.ID = d.USR$SECOND_PERFORMER
      WHERE d.ID = :dealId`;

    const oldDealRecord = await fetchAsSingletonObject(sql, { dealId });

    sql = `
      SELECT
        USR$MASTERKEY
      FROM USR$CRM_KANBAN_CARDS
      WHERE ID = :cardId`;

    const oldCardRecord = await fetchAsSingletonObject(sql, { cardId });

    sql = `
      SELECT col.ID, col.USR$NAME
      FROM USR$CRM_KANBAN_TEMPLATE temp
        JOIN USR$CRM_KANBAN_TEMPLATE_LINE templine ON templine.USR$MASTERKEY = temp.ID
        JOIN USR$CRM_KANBAN_COLUMNS col ON col.ID = templine.USR$COLUMNKEY
      WHERE temp.ID = (SELECT ID FROM GD_RUID WHERE XID = 147006332 AND DBID = 2110918267 ROWS 1)
      ORDER BY col.USR$INDEX`;

    const columns = await fetchAsObject(sql);

    /** Отключено на время продумывания перехода с этапа на этап */
    // const newStageIndex = columns.findIndex(stage => stage['ID'] === card.USR$MASTERKEY);
    // const oldStageIndex = columns.findIndex(stage => stage['ID'] === oldCardRecord?.USR$MASTERKEY);
    // if (Math.abs(newStageIndex - oldStageIndex) > 1) {
    //   return res.status(400).send(resultError('Сделку можно перемещать только на один этап'));
    // }

    const changes: IKanbanHistory[] = [];
    if ((Number(deal.USR$AMOUNT) || 0) !== (Number(oldDealRecord?.USR$AMOUNT) || 0)) {
      changes.push({
        ID: -1,
        USR$TYPE: isInsertMode ? '1' : '2',
        USR$CARDKEY: cardId,
        USR$DESCRIPTION: 'Сумма',
        USR$OLD_VALUE: (Number(oldDealRecord.USR$AMOUNT) || 0).toString(),
        USR$NEW_VALUE: (Number(deal.USR$AMOUNT) || 0).toString(),
        USR$USERKEY: userId
      });
    };
    if (deal.CONTACT?.ID !== oldDealRecord?.CONTACT_ID) {
      changes.push({
        ID: -1,
        USR$TYPE: isInsertMode ? '1' : '2',
        USR$CARDKEY: cardId,
        USR$DESCRIPTION: 'Клиент',
        USR$OLD_VALUE: oldDealRecord.CONTACT_NAME,
        USR$NEW_VALUE: deal.CONTACT.NAME,
        USR$USERKEY: userId
      });
    };
    if (deal?.USR$NAME !== oldDealRecord?.USR$NAME) {
      changes.push({
        ID: -1,
        USR$TYPE: isInsertMode ? '1' : '2',
        USR$CARDKEY: cardId,
        USR$DESCRIPTION: 'Наименование',
        USR$OLD_VALUE: oldDealRecord?.USR$NAME,
        USR$NEW_VALUE: deal.USR$NAME,
        USR$USERKEY: userId
      });
    };
    if ((deal.PERFORMERS?.[0]?.ID || -1) !== (oldDealRecord.PERMORMER_1_ID || -1)) {
      changes.push({
        ID: -1,
        USR$TYPE: isInsertMode ? '1' : '2',
        USR$CARDKEY: cardId,
        USR$DESCRIPTION: 'Исполнитель',
        USR$OLD_VALUE: oldDealRecord?.PERMORMER_1_NAME,
        USR$NEW_VALUE: deal.PERFORMERS?.[0]?.NAME,
        USR$USERKEY: userId
      });
    };
    if ((deal.PERFORMERS?.[1]?.ID || -1) !== (oldDealRecord.PERMORMER_2_ID || -1)) {
      changes.push({
        ID: -1,
        USR$TYPE: isInsertMode ? '1' : '2',
        USR$CARDKEY: cardId,
        USR$DESCRIPTION: 'Второй исполнитель',
        USR$OLD_VALUE: oldDealRecord?.PERMORMER_2_NAME,
        USR$NEW_VALUE: deal.PERFORMERS?.[1]?.NAME,
        USR$USERKEY: userId
      });
    };
    if (card.USR$MASTERKEY !== oldCardRecord?.USR$MASTERKEY) {
      changes.push({
        ID: -1,
        USR$TYPE: isInsertMode ? '1' : '2',
        USR$CARDKEY: cardId,
        USR$DESCRIPTION: 'Этап',
        USR$OLD_VALUE: columns.find(column => column['ID'] === oldCardRecord.USR$MASTERKEY)?.['USR$NAME'] || '',
        USR$NEW_VALUE: columns.find(column => column['ID'] === card.USR$MASTERKEY)?.['USR$NAME'] || '',
        USR$USERKEY: userId
      });
    };
    if (deal.PREPAID !== (oldDealRecord?.PREPAID === 1)) {
      changes.push({
        ID: -1,
        USR$TYPE: isInsertMode ? '1' : '2',
        USR$CARDKEY: cardId,
        USR$DESCRIPTION: 'Оплачено',
        USR$OLD_VALUE: oldDealRecord.PREPAID === 1 ? 'Да' : 'Нет',
        USR$NEW_VALUE: deal.PREPAID ? 'Да' : 'Нет',
        USR$USERKEY: userId
      });
    };
    if (deal.USR$READYTOWORK !== (oldDealRecord?.USR$READYTOWORK === 1)) {
      changes.push({
        ID: -1,
        USR$TYPE: isInsertMode ? '1' : '2',
        USR$CARDKEY: cardId,
        USR$DESCRIPTION: 'В работе',
        USR$OLD_VALUE: oldDealRecord.USR$READYTOWORK === 1 ? 'Да' : 'Нет',
        USR$NEW_VALUE: deal.USR$READYTOWORK ? 'Да' : 'Нет',
        USR$USERKEY: userId
      });
    };
    if (deal.USR$DONE !== (oldDealRecord?.USR$DONE === 1)) {
      changes.push({
        ID: -1,
        USR$TYPE: isInsertMode ? '1' : '2',
        USR$CARDKEY: cardId,
        USR$DESCRIPTION: 'Исполнено',
        USR$OLD_VALUE: oldDealRecord.USR$DONE === 1 ? 'Да' : 'Нет',
        USR$NEW_VALUE: deal.USR$DONE ? 'Да' : 'Нет',
        USR$USERKEY: userId
      });
    };
    if (deal.DENIED !== (oldDealRecord?.DENIED === 1)) {
      changes.push({
        ID: -1,
        USR$TYPE: isInsertMode ? '1' : '2',
        USR$CARDKEY: cardId,
        USR$DESCRIPTION: 'Отказано',
        USR$OLD_VALUE: oldDealRecord.DENIED === 1 ? 'Да' : 'Нет',
        USR$NEW_VALUE: deal.DENIED ? 'Да' : 'Нет',
        USR$USERKEY: userId
      });
    };

    sql = `
      UPDATE OR INSERT INTO USR$CRM_DEALS(ID, USR$NAME, USR$DISABLED, USR$AMOUNT, USR$CONTACTKEY, USR$CREATORKEY,
        USR$PERFORMER, USR$SECOND_PERFORMER, USR$DEADLINE, USR$SOURCEKEY, USR$READYTOWORK, USR$DONE, USR$DEPOTKEY, USR$COMMENT, USR$DENIED, USR$DENYREASONKEY,
        USR$REQUESTNUMBER, USR$PRODUCTNAME, USR$CONTACT_NAME, USR$CONTACT_EMAIL, USR$CONTACT_PHONE, USR$CREATIONDATE, USR$DESCRIPTION, USR$PREPAID)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      MATCHING (ID)
      RETURNING ID`;

    paramsValues = [
      dealId,
      deal.USR$NAME || '',
      deal.USR$DISABLED ? 1 : 0,
      deal.USR$AMOUNT || 0,
      deal.CONTACT?.ID || null,
      deal.CREATOR?.ID || null,
      deal.PERFORMERS?.[0]?.ID || null,
      deal.PERFORMERS?.[1]?.ID || null,
      deal.USR$DEADLINE ? new Date(deal.USR$DEADLINE) : null,
      deal.SOURCE?.ID || null,
      deal.USR$READYTOWORK || 0,
      deal.USR$DONE || 0,
      deal.DEPARTMENT?.ID || null,
      deal.COMMENT,
      deal.DENIED || 0,
      deal.DENYREASON?.ID || null,
      deal.REQUESTNUMBER,
      deal.PRODUCTNAME,
      deal.CONTACT_NAME,
      deal.CONTACT_EMAIL,
      deal.CONTACT_PHONE,
      deal.CREATIONDATE ? new Date(deal.CREATIONDATE) : null,
      deal.DESCRIPTION || '',
      deal.PREPAID ?? false
    ];

    const dealRecord: IDeal = await fetchAsSingletonObject(sql, paramsValues);

    /** Обновление вложений */
    const updateAttachments = async () => {
      if (!deal['ATTACHMENTS']) return;
      const deleteAttachments = await executeSingleton(
        `DELETE FROM USR$CRM_DEALS_FILES
          WHERE USR$MASTERKEY = :MASTERKEY`,
        {
          MASTERKEY: dealId
        });

      const sql = `
          INSERT INTO USR$CRM_DEALS_FILES(USR$MASTERKEY, USR$CONTENT, USR$NAME)
          VALUES(:MASTERKEY, :CONTENT, :NAME)
          RETURNING ID` ;

      const insertAttachments = deal['ATTACHMENTS']?.map(async ({ content, fileName }) => {
        return await fetchAsSingletonObject(sql, {
          MASTERKEY: dealId,
          CONTENT: await string2Blob(content),
          NAME: fileName
        });
      });

      await Promise.all([
        deleteAttachments,
        ...insertAttachments
      ]);
    };

    await updateAttachments();

    sql = `
      EXECUTE PROCEDURE USR$CRM_UPSERT_DEAL(?, ?, ?, ?, ?, ?)`;

    paramsValues = [
      dealId,
      deal.CREATOR?.ID || null,
      deal.CONTACT?.ID || null,
      deal.PERFORMERS?.[0]?.ID || null,
      deal.USR$DEADLINE ? new Date(deal.USR$DEADLINE) : null,
      deal.CREATIONDATE ? new Date(deal.CREATIONDATE) : null,
    ];

    await executeSingletonAsObject(sql, paramsValues);

    const allFields = ['ID', 'USR$INDEX', 'USR$MASTERKEY', 'USR$DEALKEY'];
    const actualFields = allFields.filter(field => typeof req.body[field] !== 'undefined');

    paramsValues = actualFields.map(field => {
      if (typeof req.body[field] === 'boolean') {
        return req.body[field] ? 1 : 0;
      };
      return field === 'USR$DEALKEY' ? dealRecord.ID : req.body[field];
    });

    if (isInsertMode) {
      paramsValues.splice(actualFields.indexOf('ID'), 1);
      actualFields.splice(actualFields.indexOf('ID'), 1);

      const requiredFields = {
        ID: cardId
      };

      for (const [key, value] of Object.entries(requiredFields)) {
        if (!actualFields.includes(key)) {
          actualFields.push(key);
          paramsValues.push(value);
        };
      };
    };

    const actualFieldsNames = actualFields.join(',');
    const paramsString = actualFields.map(_ => '?').join(',');
    const returnFieldsNames = allFields.join(',');

    sql = `
      UPDATE OR INSERT INTO USR$CRM_KANBAN_CARDS(${actualFieldsNames})
      VALUES (${paramsString})
      MATCHING (ID)
      RETURNING ${returnFieldsNames}`;

    const cardRecord: IKanbanCard = await fetchAsSingletonObject(sql, paramsValues);

    /** Устанвливаем статус НЕ прочитано */
    sql = `
      EXECUTE BLOCK(
        cardId INTEGER = ?,
        userId INTEGER = ?
      )
      AS
      DECLARE VARIABLE CON_ID INTEGER;
      BEGIN
        FOR
          SELECT u.ID
          FROM GD_CONTACT con
          JOIN GD_USER u ON u.CONTACTKEY = con.ID
          JOIN USR$CRM_DEALS deal
            ON deal.USR$CREATORKEY = con.ID
            OR deal.USR$PERFORMER = con.ID
            OR deal.USR$SECOND_PERFORMER = con.ID
          JOIN USR$CRM_KANBAN_CARDS card ON card.USR$DEALKEY = deal.ID
          WHERE card.ID = :cardId
          INTO :CON_ID
        DO
          UPDATE OR INSERT INTO USR$CRM_KANBAN_CARD_STATUS(USR$ISREAD, USR$CARDKEY, USR$USERKEY)
          VALUES(0, :cardId, :CON_ID)
          MATCHING(USR$CARDKEY, USR$USERKEY);
      END`;

    await executeSingletonAsObject(sql, [cardRecord.ID, userId]);

    const result: IRequestResult<{ cards: IKanbanCard[] }> = {
      queries: {
        cards: [Object.fromEntries(allFields.map((field, idx) => ([field, cardRecord[field]]))) as IKanbanCard]
      },
      _schema: undefined
    };

    await releaseTransaction();

    /** Обновление отзывов */
    try {
      if (deal.feedback) {
        if (deal.feedback.id > 0) {
          await dealFeedbackService.updateFeedback(req.sessionID, deal.feedback.id, deal.feedback);
        } else {
          await dealFeedbackService.createFeedback(req.sessionID, { ...deal.feedback, dealId: dealRecord.ID });
        }
      }
    } catch (error) {
      console.error('[ dealFeedback ]', error);
    }

    /** Сохранение истории изменений */
    changes.forEach(c => addHistory(req.sessionID, c));

    try {
      if (isInsertMode && deal.PERFORMERS?.length > 0) {
        await sendNewDealEmail(req.sessionID, deal, deal.PERFORMERS);
      }
    } catch (error) {
      console.error('[ sendNewDealEmail ]', error);
    }

    return res.status(200).json(result);
  } catch (error) {
    await releaseTransaction(false);
    return res.status(500).send(resultError(error.message));
  };
};

const remove: RequestHandler = async(req, res) => {
  const { id } = req.params;

  if (isNaN(Number(id))) return res.status(422).send(resultError('Field ID is not defined or isn\'t numeric'));

  const { attachment, transaction, releaseTransaction } = await startTransaction(req.sessionID);

  let result: ResultSet;
  try {
    result = await attachment.executeQuery(
      transaction,
      `EXECUTE BLOCK(
        ID INTEGER = ?
      )
      RETURNS(SUCCESS SMALLINT, USR$MASTERKEY INTEGER)
      AS
        DECLARE VARIABLE DEAL_ID INTEGER;
      BEGIN
        SUCCESS = 0;
        FOR SELECT USR$DEALKEY, USR$MASTERKEY FROM USR$CRM_KANBAN_CARDS WHERE ID = :ID INTO :DEAL_ID, :USR$MASTERKEY AS CURSOR curCARD
        DO
        BEGIN
          DELETE FROM USR$CRM_DEALS_FILES WHERE USR$MASTERKEY = :DEAL_ID;
          DELETE FROM USR$CRM_NOTIFICATIONS WHERE USR$KEY = :DEAL_ID;
          DELETE FROM USR$CRM_NOTIFICATIONS n
          WHERE EXISTS(SELECT ID FROM USR$CRM_KANBAN_CARD_TASKS t WHERE n.USR$KEY = t.ID AND t.USR$CARDKEY = :ID);
          DELETE FROM USR$CRM_KANBAN_CARDS WHERE CURRENT OF curCARD;
          DELETE FROM USR$CRM_DEALS deal WHERE deal.ID = :DEAL_ID;

          SUCCESS = 1;
        END

        SUSPEND;
      END`,
      [id]
    );

    const data: { SUCCESS: number, USR$MASTERKEY: number }[] = await result.fetchAsObject();

    if (data[0].SUCCESS !== 1) {
      return res.status(500).send(resultError('Объект не найден'));
    };

    await result.close();
    return res.status(200).json({ 'ID': id, 'USR$MASTERKEY': data[0].USR$MASTERKEY });
  } catch (error) {
    return res.status(500).send(resultError(error.message));
  } finally {
    await releaseTransaction(res.statusCode === 200);
  };
};

const getFiles: RequestHandler = async (req, res) => {
  const { id: sessionID } = req.session;
  const { id } = req.params;

  const { fetchAsObject, releaseReadTransaction, blob2String } = await acquireReadTransaction(sessionID);
  try {
    const sql = `
    SELECT
      l.USR$NAME,
      l.USR$CONTENT
    FROM USR$CRM_DEALS_FILES l
    WHERE l.USR$MASTERKEY = :masterKey`;

    const fileRows = await fetchAsObject(sql, { masterKey: id });

    const files: MailAttachment[] = [];
    await forEachAsync(fileRows, async file => {
      const content = await blob2String(file['USR$CONTENT']);
      files.push({
        fileName: file['USR$NAME'],
        content
      });
    });

    return res.status(200).json(files);
  } catch (error) {
    return res.status(500).send(resultError(error.message));
  } finally {
    await releaseReadTransaction();
  };
};

export default { get, upsert, remove, getFiles };


async function sendNewDealEmail(sessionId: string, deal: IDeal, performers: IContactWithID[]) {
  try {
    const { smtpHost, smtpPort, smtpUser, smtpPassword, OURCOMPANY: { NAME: ourCompanyName } } =
      await systemSettingsRepository.findOne(sessionId);

    for (const performer of performers) {
      const userSettings = await profileSettingsController.getSettings({ contactId: performer.ID, sessionId });
      const email = userSettings?.settings.EMAIL;
      if (!email) continue;

      const messageText = `
        <div style="max-width:600px;margin:0 auto;padding:20px;font-family:Arial">
          <div style="font-size:16px;margin-bottom:24px">Добрый день, <strong>${performer.NAME}</strong>!</div>
          <div style="font-size:20px;font-weight:bold;color:#1976d2">Вам назначена новая сделка</div>
          <div style="background:#f5f9ff;border:1px solid #e3f2fd;border-radius:8px;padding:16px;margin:16px 0">
            <div style="color:#666">Наименование: ${deal.USR$NAME || ''}</div>
            ${deal.CONTACT?.NAME ? `<div style="color:#666">Клиент: ${deal.CONTACT.NAME}</div>` : ''}
            ${deal.USR$AMOUNT ? `<div style="color:#666">Сумма: ${deal.USR$AMOUNT.toLocaleString('ru-RU')} руб.</div>` : ''}
            ${deal.USR$DEADLINE ? `<div style="color:#666">Срок: ${new Date(deal.USR$DEADLINE).toLocaleDateString('ru-RU')}</div>` : ''}
            ${deal.DESCRIPTION ? `<div style="color:#666">Описание: ${deal.DESCRIPTION}</div>` : ''}
          </div>
          <div style="margin-top:24px;border-top:1px solid #eee;padding-top:16px">
            <a href="${config.origin}/employee/managment/deals/list" style="color:#1976d2">Открыть в CRM</a>
            <p style="color:#999;font-size:12px">Это автоматическое уведомление. Пожалуйста, не отвечайте на него.</p>
          </div>
        </div>`;

      await sendEmail({
        from: `CRM система ${ourCompanyName} <${smtpUser}>`,
        to: email,
        subject: `Новая сделка: ${deal.USR$NAME}`,
        html: messageText,
        options: { host: smtpHost, port: smtpPort, user: smtpUser, password: smtpPassword }
      });
    }
  } catch (error) {
    console.error('Error sending new deal email:', error);
  }
}
