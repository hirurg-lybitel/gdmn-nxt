import { IRequestResult } from '@gsbelarus/util-api-types';
import { RequestHandler } from 'express';
import { importedModels } from '../models';
import { resultError } from '../responseMessages';
import { getReadTransaction, releaseReadTransaction, releaseTransaction, rollbackTransaction, startTransaction } from '../utils/db-connection';
import { genId } from '../utils/genId';

const eintityCrossName = 'TgdcAttrUserDefinedUSR_CRM_PERMISSIONS_CROSS';

const getCross: RequestHandler = async (req, res) => {
  const { attachment, transaction } = await getReadTransaction(req.sessionID);

  try {
    const _schema = {};

    const execQuery = async (query: string) => {
      const rs = await attachment.executeQuery(transaction, query, []);
      const data = await rs.fetchAsObject();

      await rs.close();

      return data as any;
    };

    const queries = [
      `SELECT
        cr.ID,
        cr.USR$ACTIONKEY,
        cr.USR$GROUPKEY,
        cr.USR$MODE as MODE
      FROM USR$CRM_PERMISSIONS_CROSS cr
      JOIN USR$CRM_PERMISSIONS_ACTIONS act ON act.ID = cr.USR$ACTIONKEY
      JOIN USR$CRM_PERMISSIONS_USERGROUPS ug ON ug.ID = cr.USR$GROUPKEY`,
      `SELECT act.ID, act.USR$NAME NAME
      FROM USR$CRM_PERMISSIONS_ACTIONS act`,
      `SELECT ug.ID, ug.USR$NAME NAME
      FROM USR$CRM_PERMISSIONS_USERGROUPS ug`
    ];

    const [rawCross, rawActions, rawUserGroups] = await Promise.all(queries.map(execQuery));

    const cross = rawCross.map(c => {
      const ACTION = rawActions.filter(act => act['ID'] === c['USR$ACTIONKEY'])[0];
      const USERGROUP = rawUserGroups.filter(ug => ug['ID'] === c['USR$GROUPKEY'])[0];
      const { USR$ACTIONKEY, USR$GROUPKEY, ...newObject } = c;
      return { ...newObject, ACTION, USERGROUP };
    });

    const result: IRequestResult = {
      queries: {
        cross
      },
      _schema
    };

    return res.status(200).send(result);
  } catch (error) {
    return res.status(500).send(resultError(error.message));
  } finally {
    await releaseReadTransaction(req.sessionID);
  }
};

const upsertCross: RequestHandler = async (req, res) => {
  const { attachment, transaction } = await startTransaction(req.sessionID);

  try {
    const _schema = {};

    const execQuery = async ({ name, query, params }: { name: string, query: string, params?: any[] }) => {
      const data = await attachment.executeSingletonAsObject(transaction, query, params);

      return [name, data];
    };

    const ID = await (async () => {
      const checkID = parseInt(req.body['ID']);
      return checkID > 0
        ? checkID
        : await genId(attachment, transaction);
    })();

    const { erModel } = await importedModels;
    const allFields = [...new Set(erModel.entities[eintityCrossName].attributes.map(attr => attr.name))];
    const actualFields = allFields.filter(field => {
      switch (field) {
        case 'USR$ACTIONKEY':
          return typeof req.body['ACTION'] !== 'undefined';
        case 'USR$GROUPKEY':
          return typeof req.body['USERGROUP'] !== 'undefined';
        case 'USR$MODE':
          return typeof req.body['MODE'] !== 'undefined';
        default:
          return typeof req.body[field] !== 'undefined';
      }
    });

    const paramsValues = actualFields.map(field => {
      switch (field) {
        case 'USR$ACTIONKEY':
          return req.body['ACTION']['ID'];
        case 'USR$GROUPKEY':
          return req.body['USERGROUP']['ID'];
        case 'USR$MODE':
          return req.body['MODE'];
        default:
          return req.body[field];
      }
    });

    const requiredFields = {
      ID,
    };

    for (const [key, value] of Object.entries(requiredFields)) {
      if (!actualFields.includes(key)) {
        actualFields.push(key);
        paramsValues.push(value);
      }
    };

    const actualFieldsNames = actualFields.join(',');
    const paramsString = actualFields.map( _ => '?' ).join(',');

    const query = {
      name: 'cross',
      query: `
        UPDATE OR INSERT INTO USR$CRM_PERMISSIONS_CROSS(${actualFieldsNames})
        VALUES(${paramsString})
        MATCHING(ID)
        RETURNING ${actualFieldsNames}`,
      params: paramsValues,
    };

    const result: IRequestResult = {
      queries: {
        ...Object.fromEntries([await Promise.resolve(execQuery(query))])
      },
      _schema
    };

    return res.status(200).json(result);
  } catch (error) {
    await rollbackTransaction(req.sessionID, transaction);
    return res.status(500).send(resultError(error.message));
  } finally {
    await releaseTransaction(req.sessionID, transaction);
  }
};

const getUserGroups: RequestHandler = async (req, res) => {
  const { attachment, transaction } = await getReadTransaction(req.sessionID);

  try {
    const _schema = {};

    const execQuery = async ({ name, query, params }: { name: string, query: string, params?: any[] }) => {
      const rs = await attachment.executeQuery(transaction, query, []);
      const data = await rs.fetchAsObject();
      await rs.close();

      return data as any;
    };

    const query = {
      name: 'userGroups',
      query: `
        SELECT
          ug.ID,
          ug.USR$NAME AS NAME,
          USR$DESCRIPTION DESCRIPTION
        FROM USR$CRM_PERMISSIONS_USERGROUPS ug`
    };

    const userGroups = await Promise.resolve(execQuery(query));

    const result: IRequestResult = {
      queries: {
        userGroups
      },
      _schema
    };

    return res.status(200).send(result);
  } catch (error) {
    return res.status(500).send(resultError(error.message));
  } finally {
    await releaseReadTransaction(req.sessionID);
  }
};

const upsertGroup: RequestHandler = async (req, res) => {
  const { attachment, transaction } = await startTransaction(req.sessionID);

  const isInsertMode = (req.method === 'POST');

  const id = parseInt(req.params.id);
  if (!isInsertMode) {
    if (isNaN(id)) return res.status(422).send(resultError('Поле "id" не указано или неверного типа'));
  };

  try {
    const _schema = {};

    const execQuery = async ({ name, query, params }: { name: string, query: string, params?: any[] }) => {
      const data = await attachment.executeSingletonAsObject(transaction, query, params);

      return [name, data];
    };

    const { erModel } = await importedModels;
    const allFields = [...new Set(erModel.entities['TgdcAttrUserDefinedUSR_CRM_PERMISSIONS_USERGROUPS'].attributes.map(attr => attr.name))];

    const actualFields = allFields.filter(field => typeof req.body[field.replace('USR$', '')] !== 'undefined');

    const paramsValues = actualFields.map(field => {
      return req.body[field.replace('USR$', '')];
    });

    let ID = id;
    if (isInsertMode) {
      ID = await genId(attachment, transaction);
      if (actualFields.indexOf('ID') >= 0) {
        paramsValues.splice(actualFields.indexOf('ID'), 1, ID);
      };
    };

    const requiredFields = {
      ID: ID,
    };

    for (const [key, value] of Object.entries(requiredFields)) {
      if (!actualFields.includes(key)) {
        actualFields.push(key);
        paramsValues.push(value);
      }
    };

    const actualFieldsNames = actualFields.join(',');
    const paramsString = actualFields.map( _ => '?' ).join(',');

    const query = {
      name: 'userGroup',
      query: `
        UPDATE OR INSERT INTO USR$CRM_PERMISSIONS_USERGROUPS(${actualFieldsNames})
        VALUES(${paramsString})
        MATCHING(ID)
        RETURNING ${actualFieldsNames}`,
      params: paramsValues,
    };

    const result: IRequestResult = {
      queries: {
        ...Object.fromEntries([await Promise.resolve(execQuery(query))])
      },
      _params: id ? [{ id: id }] : undefined,
      _schema
    };

    return res.status(200).json(result);
  } catch (error) {
    await rollbackTransaction(req.sessionID, transaction);
    return res.status(500).send(resultError(error.message));
  } finally {
    await releaseTransaction(req.sessionID, transaction);
  };
};

const removeGroup: RequestHandler = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(422).send(resultError('Поле "id" не указано или неверного типа'));

  const { attachment, transaction } = await startTransaction(req.sessionID);

  try {
    const result = await attachment.executeQuery(
      transaction,
      `EXECUTE BLOCK(
        ID INTEGER = ?
      )
      RETURNS(SUCCESS SMALLINT)
      AS
      DECLARE VARIABLE UG_ID INTEGER;
      BEGIN
        SUCCESS = 0;
        FOR SELECT ID FROM USR$CRM_PERMISSIONS_USERGROUPS WHERE ID = :ID INTO :UG_ID AS CURSOR curUserGroup
        DO
        BEGIN
          DELETE FROM USR$CRM_PERMISSIONS_UG_LINES
          WHERE USR$GROUPKEY = :UG_ID;

          DELETE FROM USR$CRM_PERMISSIONS_CROSS
          WHERE USR$GROUPKEY = :UG_ID;

          DELETE FROM USR$CRM_PERMISSIONS_USERGROUPS WHERE CURRENT OF curUserGroup;

          SUCCESS = 1;
        END

        SUSPEND;
      END`,
      [id]
    );

    const data: { SUCCESS: number }[] = await result.fetchAsObject();
    await result.close();
    await transaction.commit();

    if (data[0].SUCCESS !== 1) {
      return res.status(500).send(resultError('Объект не найден'));
    };

    return res.status(200).json({ id });
  } catch (error) {
    return res.status(500).send(resultError(error.message));
  } finally {
    await releaseTransaction(req.sessionID, transaction);
  };
};

const getActions: RequestHandler = async (req, res) => {
  const { attachment, transaction } = await getReadTransaction(req.sessionID);

  try {
    const _schema = {};

    const execQuery = async ({ name, query, params }: { name: string, query: string, params?: any[] }) => {
      const rs = await attachment.executeQuery(transaction, query, []);
      const data = await rs.fetchAsObject();
      await rs.close();

      return data as any;
    };

    const query = {
      name: 'actions',
      query: `
        SELECT act.ID, act.USR$NAME NAME
        FROM USR$CRM_PERMISSIONS_ACTIONS act
        ORDER BY USR$SORTNUMBER`,
    };

    const actions = await Promise.resolve(execQuery(query));

    const result: IRequestResult = {
      queries: {
        actions
      },
      _schema
    };

    return res.status(200).send(result);
  } catch (error) {
    return res.status(500).send(resultError(error.message));
  } finally {
    await releaseReadTransaction(req.sessionID);
  };
};

const getUserByGroup: RequestHandler = async (req, res) => {
  const { attachment, transaction } = await getReadTransaction(req.sessionID);

  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(422).send(resultError('Поле "id" не указано или неверного типа'));

  try {
    const _schema = {};

    const aTime = new Date().getTime();

    const execQuery = async ({ name, query, params }: { name: string, query: string, params?: any[] }) => {
      const rs = await attachment.executeQuery(transaction, query, params);
      const data = await rs.fetchAsObject();
      await rs.close();

      return data as any;
    };

    const query = {
      name: 'users',
      query: `
        SELECT
          ul.ID,
          u.NAME,
          u.FULLNAME,
          u.DISABLED,
          con.ID AS CONTACT_ID,
          con.NAME AS CONTACT_NAME,
          con.PHONE
        FROM USR$CRM_PERMISSIONS_USERGROUPS ug
        JOIN USR$CRM_PERMISSIONS_UG_LINES ul ON ul.USR$GROUPKEY = ug.ID
        JOIN GD_USER u ON u.ID = ul.USR$USERKEY
        JOIN GD_CONTACT con ON con.ID = u.CONTACTKEY
        WHERE
          ug.ID = ?`,
      params: [id]
    };

    const rawUsers = await Promise.resolve(execQuery(query));


    const users = rawUsers.map(user => {
      const CONTACT = { ID: user['CONTACT_ID'], NAME: user['CONTACT_NAME'], PHONE: user['PHONE'] };
      const { CONTACT_ID, CONTACT_NAME, PHONE, ...newObject } = user;
      return { ...newObject, CONTACT };
    });
    // const [rawCross, rawActions] = await Promise.all(queries.map(execQuery));

    const result: IRequestResult = {
      queries: {
        users
      },
      ...(id ? { _params: [{ id: id }] } : {}),
      _schema
    };

    console.log(`fetch time ${new Date().getTime() - aTime} ms`);

    return res.status(200).send(result);
  } catch (error) {
    return res.status(500).send(resultError(error.message));
  } finally {
    await releaseReadTransaction(req.sessionID);
  }
};

const addUserGroupLine: RequestHandler = async (req, res) => {
  const { attachment, transaction } = await startTransaction(req.sessionID);

  try {
    const _schema = {};

    const execQuery = async ({ name, query, params }: { name: string, query: string, params?: any[] }) => {
      const data = await attachment.executeSingletonAsObject(transaction, query, params);

      return [name, data];
    };

    const { erModel } = await importedModels;
    const allFields = [...new Set(erModel.entities['TgdcAttrUserDefinedUSR_CRM_PERMISSIONS_UG_LINES'].attributes.map(attr => attr.name))];

    const actualFields = allFields.filter(field => {
      switch (field) {
        case 'USR$USERKEY':
          return typeof req.body['USER'] !== 'undefined';
        case 'USR$GROUPKEY':
          return typeof req.body['USERGROUP'] !== 'undefined';
        default:
          return typeof req.body[field] !== 'undefined';
      }
    });

    const paramsValues = actualFields.map(field => {
      switch (field) {
        case 'USR$USERKEY':
          return req.body['USER']['ID'];
        case 'USR$GROUPKEY':
          return req.body['USERGROUP']['ID'];
        default:
          return req.body[field];
      }
    });

    const query = {
      name: 'users',
      query: `
      INSERT INTO USR$CRM_PERMISSIONS_UG_LINES(USR$USERKEY, USR$GROUPKEY)
      VALUES(?, ?)
      RETURNING ID, USR$USERKEY, USR$GROUPKEY`,
      params: paramsValues,
    };

    const result: IRequestResult = {
      queries: {
        ...Object.fromEntries([await Promise.resolve(execQuery(query))])
      },
      _schema
    };

    return res.status(200).json(result);
  } catch (error) {
    await rollbackTransaction(req.sessionID, transaction);
    return res.status(500).send(resultError(error.message));
  } finally {
    await releaseTransaction(req.sessionID, transaction);
  };
};

const removeUserGroupLine: RequestHandler = async (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) return res.status(422).send(resultError('Поле "id" не указано или неверного типа'));

  const { attachment, transaction } = await startTransaction(req.sessionID);

  try {
    const result = await attachment.executeQuery(
      transaction,
      `EXECUTE BLOCK(
        ID INTEGER = ?
      )
      RETURNS(SUCCESS SMALLINT)
      AS
      DECLARE VARIABLE UG_ID INTEGER;
      BEGIN
        SUCCESS = 0;
        FOR SELECT ID FROM USR$CRM_PERMISSIONS_UG_LINES WHERE ID = :ID INTO :UG_ID AS CURSOR curUserGroup
        DO
        BEGIN
          DELETE FROM USR$CRM_PERMISSIONS_UG_LINES WHERE CURRENT OF curUserGroup;

          SUCCESS = 1;
        END

        SUSPEND;
      END`,
      [id]
    );

    const data: { SUCCESS: number }[] = await result.fetchAsObject();
    await result.close();
    await transaction.commit();

    if (data[0].SUCCESS !== 1) {
      return res.status(500).send(resultError('Объект не найден'));
    };

    return res.status(200).json({ id });
  } catch (error) {
    return res.status(500).send(resultError(error.message));
  } finally {
    await releaseTransaction(req.sessionID, transaction);
  };
};


export default {
  getCross,
  upsertCross,
  upsertGroup,
  removeGroup,
  getActions,
  getUserGroups,
  getUserByGroup,
  addUserGroupLine,
  removeUserGroupLine
};
