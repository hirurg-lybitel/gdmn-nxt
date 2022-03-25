import { IRequestResult } from '@gsbelarus/util-api-types';
import { RequestHandler } from 'express';
import { importedModels } from '../models';
import { resultError } from '../responseMessages';
import { commitTransaction, getReadTransaction, releaseReadTransaction, startTransaction } from '../utils/db-connection';
import { genId } from '../utils/genId';
import { sqlQuery } from '../utils/sqlQuery';

const getByCutomerId: RequestHandler = async (req, res) => {
  const { attachment, transaction } = await getReadTransaction(req.sessionID);

  try {
    const customerId = parseInt(req.params.customerId);

    const sql = new sqlQuery(attachment, transaction);
    sql.SQLtext = `
      SELECT ID FROM GD_CONTACT
      WHERE UPPER(NAME) = 'КОНТАКТЫ' AND PARENT = :CompanyId`;
    sql.setParamByName('CompanyId').value = customerId;

    let sqlResult = await sql.execute();

    const contactFolderId = sqlResult.length ? sqlResult[0]['ID'] : -1;

    sql.clear();
    sql.SQLtext = `
      SELECT dep.ID, dep.NAME
      FROM GD_CONTACT con
      JOIN GD_CONTACT dep ON dep.ID = con.USR$BG_OTDEL
      WHERE con.PARENT = :FolderId`;
    sql.setParamByName('FolderId').value = contactFolderId;
    sqlResult = await sql.execute();

    interface IMapOfArrays {
      [customerId: string]: any;
    };
    const departments: IMapOfArrays = {};

    sqlResult.forEach(res => {
      if (!departments[res['ID']]) {
        departments[res['ID']] = { ID: res['ID'], NAME: res['NAME'] };
      };
    });

    const { erModelNoAdapters } = await importedModels;
    const allFields = erModelNoAdapters.entities['TgdcContact'].attributes.map(attr => attr.name);
    const actualFieldsNames = allFields.join(',');

    sql.clear();
    sql.SQLtext = `
      SELECT ${actualFieldsNames}
      FROM GD_CONTACT
      WHERE PARENT = :FolderId
      ORDER BY ID DESC`;
    sql.setParamByName('FolderId').value = contactFolderId;
    sqlResult = await sql.execute();

    sqlResult.forEach(res => {
      res['USR$BG_OTDEL'] = departments[res['USR$BG_OTDEL']];
    });

    const result: IRequestResult = {
      queries: { sqlResult },
      _params: [{ customerId }],
      _schema: {}
    };

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).send(resultError(error.message));
  } finally {
    await releaseReadTransaction(req.sessionID);
  };
};

const get: RequestHandler = async (req, res) => {
  const { attachment, transaction } = await getReadTransaction(req.sessionID);

  try {
    const id = parseInt(req.params.id);

    const sql = new sqlQuery(attachment, transaction);
    sql.SQLtext = `
      SELECT dep.ID, dep.NAME
      FROM GD_CONTACT con
      JOIN GD_CONTACT dep ON dep.ID = con.USR$BG_OTDEL
      WHERE con.ID = :id`;
    sql.setParamByName('id').value = id;
    let sqlResult = await sql.execute();

    interface IMapOfArrays {
      [customerId: string]: any;
    };
    const departments: IMapOfArrays = {};

    sqlResult.forEach(res => {
      if (!departments[res['ID']]) {
        departments[res['ID']] = { ID: res['ID'], NAME: res['NAME'] };
      };
    });

    const { erModelNoAdapters } = await importedModels;
    const allFields = erModelNoAdapters.entities['TgdcContact'].attributes.map(attr => attr.name);
    const actualFieldsNames = allFields.join(',');

    sql.clear();
    sql.SQLtext = `
      SELECT ${actualFieldsNames}
      FROM GD_CONTACT
      WHERE ID = :id`;
    sql.setParamByName('id').value = id;
    sqlResult = await sql.execute();

    sqlResult.forEach(res => {
      res['USR$BG_OTDEL'] = departments[res['USR$BG_OTDEL']];
    });

    const result: IRequestResult = {
      queries: { sqlResult },
      _params: [{ id }],
      _schema: {}
    };

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).send(resultError(error.message));
  } finally {
    await releaseReadTransaction(req.sessionID);
  };
};

const upsert: RequestHandler = async (req, res) => {
  const { attachment, transaction } = await startTransaction(req.sessionID);

  const { id } = req.params;

  if (id && isNaN(Number(id))) return res.status(422).send(resultError('Field ID is not defined or is not numeric'));;

  try {
    const isInsertMode = id ? false : true;

    let ID = Number(id);
    if (isInsertMode) {
      ID = await genId(attachment, transaction);
    };

    const { erModelNoAdapters } = await importedModels;
    const allFields = erModelNoAdapters.entities['TgdcContact'].attributes.map(attr => attr.name);
    const actualFields = allFields.filter(field => typeof req.body[field] !== 'undefined');

    const paramsValues = actualFields.map(field => {
      return req.body[field];
    });

    if (actualFields.indexOf('ID') > 0) {
      actualFields.splice(actualFields.indexOf('ID'), 1);
      paramsValues.splice(actualFields.indexOf('ID'), 1);
    };
    actualFields.unshift('ID');
    paramsValues.unshift(ID);

    const requiredFields = {
      ID: ID
    };

    for (const [key, value] of Object.entries(requiredFields)) {
      if (!actualFields.includes(key)) {
        actualFields.push(key);
        paramsValues.push(value);
      }
    };

    const actualFieldsNames = actualFields.join(',');
    const paramsString = actualFields.map(field => ':' + field).join(',');
    const returnFieldsNames = allFields.join(',');

    const sql = new sqlQuery(attachment, transaction);
    sql.SQLtext = `
      UPDATE OR INSERT INTO GD_CONTACT(${actualFieldsNames})
      VALUES (${paramsString})
      MATCHING (ID)
      RETURNING ${returnFieldsNames}`;

    paramsValues.forEach((param, index) => {
      sql.setParamByName(actualFields[index]).value = param;
    });

    const sqlResult = await sql.execute();

    const result: IRequestResult = {
      queries: { sqlResult },
      _params: [{ id }],
      _schema: {}
    };

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).send(resultError(error.message));
  } finally {
    await commitTransaction(req.sessionID, transaction);
  };
};

const remove: RequestHandler = async (req, res) => {
  const { attachment, transaction } = await startTransaction(req.sessionID);

  const id = parseInt(req.params.id);

  if (isNaN(id)) return res.status(422).send(resultError('Field ID is not defined or is not numeric'));;

  try {
    const { erModelNoAdapters } = await importedModels;
    const allFields = erModelNoAdapters.entities['TgdcContact'].attributes.map(attr => attr.name);
    const returnFieldsNames = allFields.join(',');

    const sql = new sqlQuery(attachment, transaction);
    sql.SQLtext = `
      DELETE FROM GD_CONTACT
      WHERE ID = :ID
      RETURNING ${returnFieldsNames}`;

    sql.setParamByName('ID').value = id;

    const sqlResult = await sql.execute();

    if (!sqlResult['ID']) {
      return res.status(500).send(resultError('Объект не найден'));
    };

    const result: IRequestResult = {
      queries: { sqlResult },
      _params: [{ id }],
      _schema: {}
    };

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).send(resultError(error.message));
  } finally {
    await commitTransaction(req.sessionID, transaction);
  };
};

export default { getByCutomerId, get, upsert, remove };
