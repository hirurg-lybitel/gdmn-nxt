import { IBusinessProcess, IContactPerson, IDataSchema, ILabel, ILabelsContact, IRequestResult } from '@gsbelarus/util-api-types';
import { RequestHandler } from 'express';
import { genId, getReadTransaction, releaseReadTransaction, releaseTransaction, startTransaction } from '@gdmn-nxt/db-connection';
import { resultError } from '../responseMessages';
import { cacheManager } from '@gdmn-nxt/cache-manager';
import { ContactBusiness, ContactLabel, Customer, CustomerInfo, CustomerPerson, Phone, cachedRequets } from '../utils/cached requests';
import { bin2String, string2Bin } from '@gsbelarus/util-helpers';
import { testItem } from '../../../../gdmn-nxt-web/src/app/components/email-template-list/textItem';
import { importedModels } from '../utils/models';
import { ResultSet } from 'node-firebird-driver-native';

const eintityName = 'TgdcAttrUserDefinedUSR_CRM_MARKETING_TEMPLATES';

export const get: RequestHandler = async (req, res) => {
  const { attachment, transaction } = await getReadTransaction(req.sessionID);

  const { id } = req.params;

  const { pageSize, pageNo, name: nameFilter } = req.query;
  let fromRecord = 0;
  let toRecord: number;

  if (pageNo && pageSize) {
    fromRecord = Number(pageNo) * Number(pageSize);
    toRecord = fromRecord + Number(pageSize);
  };

  try {
    const _schema = {};
    let count = 0;
    const execQuery = async ({ name, query, params }: { name: string, query: string, params?: any[] }) => {
      const rs = await attachment.executeQuery(transaction, query, params);
      try {
        const data = await rs.fetchAsObject();
        const dataWithFilter = (nameFilter && nameFilter !== '') ? data.filter(item => item['USR$NAME'].indexOf(nameFilter) !== -1) : data;
        count = dataWithFilter.length;
        const dataWitPagination = dataWithFilter.slice(fromRecord, toRecord);
        for (const r of dataWitPagination) {
          if (r['USR$HTML'] !== null && typeof r['USR$HTML'] === 'object') {
            const readStream = await attachment.openBlob(transaction, r['USR$HTML']);
            const blobLength = await readStream?.length;
            const resultBuffer = Buffer.alloc(blobLength);
            let size = 0;
            let n: number;
            while (size < blobLength && (n = await readStream.read(resultBuffer.subarray(size))) > 0) size += n;
            await readStream.close();
            const blob2String = resultBuffer.toString();
            r['USR$HTML'] = bin2String(blob2String.split(','));
          };
        };

        return [name, id ? dataWitPagination.length > 0 ? dataWitPagination[0] : {} : dataWitPagination];
      } finally {
        await rs.close();
      }
    };

    const queries = [
      {
        name: id ? 'template' : 'templates',
        query: `
          SELECT ID, USR$HTML, USR$NAME
          FROM USR$CRM_MARKETING_TEMPLATES
          ${id ? ' WHERE ID = ?' : ''}`,
        params: id ? [id] : undefined,
      },
    ];

    const result = {
      queries: {
        ...Object.fromEntries(await Promise.all(queries.map(execQuery))),
        count
      },
      _params: id ? [{ id: id }] : undefined,
      _schema
    };

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).send(resultError(error.message));
  } finally {
    await releaseReadTransaction(req.sessionID);
  }
};

const upsert: RequestHandler = async (req, res) => {
  const { attachment, transaction, releaseTransaction } = await startTransaction(req.sessionID);

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
    const allFields = [...new Set(erModel.entities[eintityName].attributes.map(attr => attr.name))];
    const actualFields = allFields.filter(field => typeof req.body[field] !== 'undefined');

    const paramsValues = await Promise.all(actualFields.map(async (field) => {
      if (field === 'USR$HTML' && req.body[field]) {
        const charArrayString = req.body[field] !== null ? string2Bin(req.body[field]).toString() : null;
        const blobBuffer = Buffer.alloc(charArrayString !== null ? charArrayString?.length : 0, charArrayString);
        const blob = await attachment.createBlob(transaction);
        await blob.write(blobBuffer);
        await blob.close();
        return blob;
      }
      return req.body[field];
    }));

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
    const paramsString = actualFields.map(_ => '?').join(',');
    const query = {
      name: 'templates',
      query: `
        UPDATE OR INSERT INTO USR$CRM_MARKETING_TEMPLATES(${actualFieldsNames})
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
    return res.status(500).send(resultError(error.message));
  } finally {
    await releaseTransaction(res.statusCode === 200);
  };
};

const remove: RequestHandler = async(req, res) => {
  const id = parseInt(req.params.id);
  const { attachment, transaction, releaseTransaction } = await startTransaction(req.sessionID);

  let result: ResultSet;
  try {
    result = await attachment.executeQuery(
      transaction,
      `EXECUTE BLOCK(
        ID INTEGER = ?
      )
      RETURNS(SUCCESS SMALLINT)
      AS
      DECLARE VARIABLE LAB_ID INTEGER;
      BEGIN
        SUCCESS = 0;
        FOR SELECT ID FROM USR$CRM_MARKETING_TEMPLATES WHERE ID = :ID INTO :LAB_ID AS CURSOR curTEMPLATES
        DO
        BEGIN
          DELETE FROM USR$CRM_MARKETING_TEMPLATES WHERE CURRENT OF curTEMPLATES;
          SUCCESS = 1;
        END
        SUSPEND;
      END`,
      [id]
    );

    const data: { SUCCESS: number }[] = await result.fetchAsObject();
    await result.close();

    if (data[0].SUCCESS !== 1) {
      return res.status(500).send(resultError('Объект не найден'));
    }

    return res.status(200).json({ 'id': id });
  } catch (error) {
    return res.status(500).send(resultError(error.message));
  } finally {
    await releaseTransaction();
  }
};

export const templatesController = { get, upsert, remove };