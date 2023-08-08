import { RequestHandler } from 'express';
import { acquireReadTransaction, startTransaction} from '../../utils/db-connection';
import { resultError } from '../../responseMessages';
import { IRequestResult } from '@gsbelarus/util-api-types';
import { bin2String, string2Bin } from '@gsbelarus/util-helpers';
const get: RequestHandler = async (req, res) => {
  const { fetchAsObject, releaseReadTransaction, attachment, transaction } = await acquireReadTransaction(req.sessionID);

  try {
    const _schema = {};

    const sql = `
      SELECT
        ID, USR$NAME NAME, USR$ICON ICON_BLOB
      FROM USR$CRM_DEALS_CLIENT_STORY_TYPE`;

    const clientHistoryTypes = await fetchAsObject(sql);


    for (const r of clientHistoryTypes) {
      if (r['ICON_BLOB'] !== null && typeof r['ICON_BLOB'] === 'object') {
        const readStream = await attachment.openBlob(transaction, r['ICON_BLOB']);
        const blobLength = await readStream?.length;
        const resultBuffer = Buffer.alloc(blobLength);

        let size = 0;
        let n: number;
        while (size < blobLength && (n = await readStream.read(resultBuffer.subarray(size))) > 0) size += n;

        await readStream.close();

        const blob2String = resultBuffer.toString();
        r['ICON'] = bin2String(blob2String.split(','));
      };

      delete r['ICON_BLOB'];
    };

    const result: IRequestResult = {
      queries: {
        clientHistoryTypes
      },
      _schema
    };

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).send(resultError(error.message));
  } finally {
    await releaseReadTransaction();
  }
};

const upsert: RequestHandler = async (req, res) => {
  const isInsertMode = (req.method === 'POST');

  const id = parseInt(req.params.id);
  if (!isInsertMode) {
    if (isNaN(id)) return res.status(422).send(resultError('Поле "id" не указано или неверного типа'));
  };

  const { fetchAsSingletonObject, releaseTransaction, generateId, attachment, transaction } = await startTransaction(req.sessionID);

  try {
    const _schema = {};

    const { NAME, ICON } = req.body;

    const charArrayString = ICON !== null ? string2Bin(ICON).toString() : null;
    const blobBuffer = Buffer.alloc(charArrayString !== null ? charArrayString?.length : 0, charArrayString);
    const blob = await attachment.createBlob(transaction);
    await blob.write(blobBuffer);
    await blob.close();

    const ID = await (() => {
      if (isNaN(id) || id <= 0) {
        return generateId();
      };
      return id;
    })() ;

    const sql = isInsertMode
      ? `
        INSERT INTO USR$CRM_DEALS_CLIENT_STORY_TYPE(ID, USR$NAME, USR$ICON)
        VALUES(:ID, :NAME, :ICON)
        RETURNING ID`
      : `
        UPDATE USR$CRM_DEALS_CLIENT_STORY_TYPE
        SET
          USR$NAME = :NAME,
          USR$ICON = :ICON
        WHERE ID = :ID
        RETURNING ID`;

    const params = {
      ID,
      NAME,
      ICON: blob
    };

    const clientStory = await fetchAsSingletonObject(sql, params);

    const result: IRequestResult = {
      queries: {
        clientStory: { ...clientStory, ...req.body }
      },
      _schema
    };

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).send(resultError(error.message));
  } finally {
    await releaseTransaction(res.statusCode === 200);
  }
};


export const clientHistoryTypesController = {
  get,
  upsert
};
