import { IDeal, IEntities, IKanbanCard, IKanbanColumn, IRequestResult } from '@gsbelarus/util-api-types';
import { RequestHandler } from 'express';
import { ResultSet } from 'node-firebird-driver-native';
import { importModels } from '../er/er-utils';
import { resultError } from '../responseMessages';
import { acquireReadTransaction, commitTransaction, getReadTransaction, releaseReadTransaction, releaseTransaction, startTransaction } from '../utils/db-connection';
import { genId } from '../utils/genId';

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

    await commitTransaction(req.sessionID, transaction);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).send(resultError(error.message));
  } finally {
    await releaseReadTransaction(req.sessionID);
  };
};

const upsert: RequestHandler = async (req, res) => {
  const { attachment, transaction } = await startTransaction(req.sessionID);

  const { releaseReadTransaction, fetchAsObject } = await acquireReadTransaction(req.sessionID);

  const { id } = req.params;

  if (id && isNaN(Number(id))) return res.status(422).send(resultError('Field ID is not defined or is not numeric'));

  try {
    const isInsertMode = id ? false : true;

    let ID = Number(id);
    if (isInsertMode) {
      ID = await genId(attachment, transaction);
    };

    // const erModelFull = importERModel('TgdcDepartment');
    // const entites: IEntities = Object.fromEntries(Object.entries((await erModelFull).entities));

    // const allFields = [...new Set(entites['TgdcDepartment'].attributes.map(attr => attr.name))];

    let paramsValues;
    let sql;
    const deal: IDeal = req.body['DEAL'];

    // allFields = ['ID', 'USR$NAME', 'USR$DISABLED', 'USR$AMOUNT', 'USR$CONTACTKEY'];
    // actualFields = allFields.filter(field => typeof req.body['DEAL'][field] !== 'undefined');

    // paramsValues = actualFields.map(field => {
    //   return req.body[field];
    // });

    // actualFields = actualFields.map(field => field === 'USR$DEALKEY' ? 'ID' : field);

    // if (isInsertMode) {
    //   paramsValues.splice(actualFields.indexOf('ID'), 1);
    //   actualFields.splice(actualFields.indexOf('ID'), 1);

    //   const requiredFields = {
    //     ID: ID
    //   };

    //   for (const [key, value] of Object.entries(requiredFields)) {
    //     if (!actualFields.includes(key)) {
    //       actualFields.push(key);
    //       paramsValues.push(value);
    //     };
    //   };
    // };

    // actualFieldsNames = actualFields.join(',');
    // paramsString = actualFields.map(_ => '?').join(',');
    // returnFieldsNames = actualFields.join(',');

    sql = `
      UPDATE OR INSERT INTO USR$CRM_DEALS(ID, USR$NAME, USR$DISABLED, USR$AMOUNT, USR$CONTACTKEY, USR$CREATORKEY,
        USR$PERFORMER, USR$DEADLINE, USR$SOURCEKEY, USR$READYTOWORK, USR$DONE, USR$DEPOTKEY, USR$COMMENT, USR$DENIED, USR$DENYREASONKEY,
        USR$REQUESTNUMBER, USR$PRODUCTNAME, USR$CONTACT_NAME, USR$CONTACT_EMAIL, USR$CONTACT_PHONE, USR$CREATIONDATE, USR$DESCRIPTION)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      MATCHING (ID)
      RETURNING ID`;

    paramsValues = [
      ID,
      deal.USR$NAME || '',
      deal.USR$DISABLED ? 1 : 0,
      deal.USR$AMOUNT || 0,
      deal.CONTACT?.ID || null,
      deal.CREATOR?.ID || null,
      deal.PERFORMER?.ID || null,
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
      deal.DESCRIPTION || ''
    ];

    const dealRecord: IDeal = await attachment.executeSingletonAsObject(transaction, sql, paramsValues);

    // sql = `
    //   EXECUTE PROCEDURE USR$CRM_CREATE_DEAL(
    //     ${deal.CREATOR.ID || null},
    //     ${deal.CONTACT.ID || null},
    //     ${deal.PERFORMER?.ID || null},
    //     ${new Date(deal.USR$DEADLINE).toLocaleDateString() || null}
    //   )`;

    // DEALKEY DINTKEY,
    // USERKEY DINTKEY,
    // CONTACTKEY USR$GS_DCUSTOMER,
    // EMPLKEY USR$BN_DEMPLOYEE,
    // DATEENDPLAN DDATE,
    // CREATIONDATE DDATE)

    sql = `
      EXECUTE PROCEDURE USR$CRM_UPSERT_DEAL(?, ?, ?, ?, ?, ?)`;

    paramsValues = [
      ID,
      deal.CREATOR?.ID || null,
      deal.CONTACT?.ID || null,
      deal.PERFORMER?.ID || null,
      deal.USR$DEADLINE ? new Date(deal.USR$DEADLINE) : null,
      deal.CREATIONDATE ? new Date(deal.CREATIONDATE) : null,
    ];

    const rec = await attachment.executeSingletonAsObject(transaction, sql, paramsValues);
    // const rec = fetchAsObject(sql, [{ 'USERKEY': 159661087 }, { 'CONTACTKEY': 159661087 }]);

    if (isInsertMode) {
      ID = await genId(attachment, transaction);
    };

    const allFields = ['ID', 'USR$INDEX', 'USR$MASTERKEY', 'USR$DEALKEY', 'USR$ISREAD'];
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
        ID: ID
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

    const cardRecord: IKanbanCard = await attachment.executeSingletonAsObject(transaction, sql, paramsValues);

    const result: IRequestResult<{ cards: IKanbanCard[] }> = {
      queries: {
        cards: [Object.fromEntries(allFields.map((field, idx) => ([field, cardRecord[field]]))) as IKanbanCard]
      },
      _schema: undefined
    };

    await transaction.commit();

    // await commitTransaction(req.sessionID, transaction);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).send(resultError(error.message));
  } finally {
    await releaseTransaction(req.sessionID, transaction);
  };
};

const remove: RequestHandler = async(req, res) => {
  const { attachment, transaction } = await startTransaction(req.sessionID);

  const { id } = req.params;

  if (isNaN(Number(id))) return res.status(422).send(resultError('Field ID is not defined or isn\'t numeric'));

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
          DELETE FROM USR$CRM_KANBAN_CARDS WHERE CURRENT OF curCARD;
          DELETE FROM USR$CRM_DEALS deal WHERE deal.ID = :DEAL_ID;
          DELETE FROM USR$CRM_NOTIFICATIONS WHERE USR$KEY = :DEAL_ID;

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
    await commitTransaction(req.sessionID, transaction);
    return res.status(200).json({ 'ID': id, 'USR$MASTERKEY': data[0].USR$MASTERKEY });
  } catch (error) {
    return res.status(500).send(resultError(error.message));
  } finally {
    await releaseTransaction(req.sessionID, transaction);
  };
};

export default { get, upsert, remove };
