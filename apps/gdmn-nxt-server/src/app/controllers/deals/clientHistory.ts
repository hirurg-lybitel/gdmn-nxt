import { RequestHandler } from 'express';
import { acquireReadTransaction, startTransaction } from '../../utils/db-connection';
import { resultError } from '../../responseMessages';
import { IClientHistory, IDataSchema, IRequestResult } from '@gsbelarus/util-api-types';

const get: RequestHandler = async (req, res) => {
  const { fetchAsObject, releaseReadTransaction } = await acquireReadTransaction(req.sessionID);

  const { clientId } = req.params;

  try {
    const _schema: IDataSchema = {
      clientHistory: {
        CREATIONDATE: {
          type: 'timestamp'
        }
      }
    };

    const execQuery = async ({ name, query, params }: { name: string, query: string, params?: any }) => {
      const records = await fetchAsObject(query, params);
      const sch = _schema[name];

      if (sch) {
        records.forEach(rec => {
          for (const fld of Object.keys(rec)) {
            if ((sch[fld]?.type === 'date' || sch[fld]?.type === 'timestamp') && rec[fld] !== null) {
              rec[fld] = (rec[fld] as Date).getTime();
            }
          }
        });
      };

      return records;
    };

    const query = {
      name: 'clientHistory',
      query: `
        SELECT
          story.ID,
          story.USR$CONTENT CONTENT,
          story.USR$CREATIONDATE CREATIONDATE,
          creator.ID CREATOR_ID,
          creator.NAME CREATOR_NAME,
          client.ID CLIENT_ID,
          client.NAME CLIENT_NAME,
          stype.ID AS STYPE_ID,
          stype.USR$NAME AS STYPE_NAME,
          stype.USR$ICON_KEY AS STYPE_ICON_KEY
        FROM USR$CRM_DEALS_CLIENT_STORY story
        JOIN USR$CRM_DEALS_CLIENT_STORY_TYPE stype ON stype.ID = story.USR$STORY_TYPE_KEY
        JOIN GD_CONTACT creator ON creator.ID = story.USR$CREATORKEY
        JOIN GD_CONTACT client ON client.ID = story.USR$CONTACTKEY
        WHERE
          story.USR$CONTACTKEY = :clientId
        ORDER BY story.USR$CREATIONDATE DESC`,
      params: { clientId }
    };

    const rawClientHistory = await Promise.resolve(execQuery(query));

    const clientHistory: IClientHistory[] = rawClientHistory.map((r: any) => {
      const { CLIENT_ID, CLIENT_NAME, CREATOR_ID, CREATOR_NAME, STYPE_ID, STYPE_NAME, STYPE_ICON_KEY, ...rest } = r;
      return {
        ...rest,
        CONTACT: {
          ID: CLIENT_ID,
          NAME: CLIENT_NAME
        },
        CREATOR: {
          ID: CREATOR_ID,
          NAME: CREATOR_NAME
        },
        historyType: {
          ID: STYPE_NAME,
          NAME: STYPE_NAME,
          ICON: STYPE_ICON_KEY
        }
      };
    });

    const result: IRequestResult = {
      queries: {
        clientHistory
      },
      _params: [{ clientId }],
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

  const { fetchAsSingletonObject, releaseTransaction, generateId } = await startTransaction(req.sessionID);

  try {
    const _schema = {};

    const { CONTENT, historyType, CONTACT, CREATOR } = req.body;

    const ID = await (() => {
      if (isNaN(id) || id <= 0) {
        return generateId();
      };
      return id;
    })() ;

    const sql = isInsertMode
      ? `
        INSERT INTO USR$CRM_DEALS_CLIENT_STORY(ID, USR$STORY_TYPE_KEY, USR$CONTENT, USR$CONTACTKEY, USR$CREATORKEY)
        VALUES(:ID, :STORY_TYPE_KEY, :CONTENT, :CONTACTKEY, :CREATORKEY)
        RETURNING ID`
      : `
        UPDATE USR$CRM_DEALS_CLIENT_STORY
        SET
          USR$STORY_TYPE_KEY = :STORY_TYPE_KEY,
          USR$CONTENT = :CONTENT,
          USR$CONTACTKEY = :CONTACTKEY,
          USR$CREATORKEY = :CREATORKEY
        WHERE ID = :ID
        RETURNING ID`;

    const params = {
      ID,
      CONTENT,
      STORY_TYPE_KEY: historyType.ID,
      CONTACTKEY: CONTACT.ID,
      CREATORKEY: CREATOR.ID
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


export const clientHistoryController = {
  get,
  upsert
};
