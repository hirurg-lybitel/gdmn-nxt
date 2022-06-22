import { IDataSchema, IEntities, IKanbanCard, IKanbanColumn, IRequestResult } from '@gsbelarus/util-api-types';
import { RequestHandler } from 'express';
import { ResultSet } from 'node-firebird-driver-native';
import { importModels } from '../er/er-utils';
import { resultError } from '../responseMessages';
import { acquireReadTransaction, commitTransaction, getReadTransaction, releaseReadTransaction, releaseTransaction, startTransaction } from '../utils/db-connection';

const get: RequestHandler = async (req, res) => {
  const { attachment, transaction } = await getReadTransaction(req.sessionID);

  const execQuery = async ({ name, query }) => {
    const rs = await attachment.executeQuery(transaction, query);

    try {
      const data = await rs.fetchAsObject();
      const sch = _schema[name];

      if (sch) {
        for (const rec of data) {
          for (const fld of Object.keys(rec)) {
            if ((sch[fld]?.type === 'date' || sch[fld]?.type === 'timestamp') && rec[fld] !== null) {
              rec[fld] = (rec[fld] as Date).getTime();
            }
            if ((sch[fld]?.type === 'boolean') && rec[fld] !== null) {
              rec[fld] = +rec[fld] === 1;
            }
          }
        }
      };

      return data as any;
    } finally {
      await rs.close();
    }
  };

  const _schema: IDataSchema = {
    tasks: {
      USR$DEADLINE: {
        type: 'date'
      },
      USR$DATECLOSE: {
        type: 'date'
      },
      USR$CREATIONDATE: {
        type: 'date'
      },
      USR$CLOSED: {
        type: 'boolean'
      }
    }
  };

  const queries = [
    {
      name: 'columns',
      query:
        `SELECT col.ID, col.USR$INDEX, col.USR$NAME
        FROM USR$CRM_KANBAN_TEMPLATE temp
          JOIN USR$CRM_KANBAN_TEMPLATE_LINE templine ON templine.USR$MASTERKEY = temp.ID
          JOIN USR$CRM_KANBAN_COLUMNS col ON col.ID = templine.USR$COLUMNKEY
        ORDER BY col.USR$INDEX`
    },
    {
      name: 'cards',
      query:
        `SELECT
          card.ID, COALESCE(card.USR$INDEX, 0) USR$INDEX, card.USR$MASTERKEY,
          card.USR$DEALKEY, deal.ID deal_ID, deal.USR$NAME deal_USR$NAME, deal.USR$DISABLED deal_USR$DISABLED,
          deal.USR$AMOUNT deal_USR$AMOUNT, deal.USR$CONTACTKEY deal_USR$CONTACTKEY,
          con.ID con_ID, con.NAME con_NAME,
          performer.ID AS PERFORMER_ID,
          performer.NAME AS PERFORMER_NAME,
          creator.ID AS CREATOR_ID,
          creator.NAME AS CREATOR_NAME,
          deal.USR$SOURCE,
          deal.USR$DEADLINE,
          deal.USR$DONE,
          deal.USR$READYTOWORK
        FROM USR$CRM_KANBAN_CARDS card
          JOIN USR$CRM_DEALS deal ON deal.ID = card.USR$DEALKEY
          JOIN GD_CONTACT con ON con.ID = deal.USR$CONTACTKEY
          LEFT JOIN GD_CONTACT performer ON performer.ID = deal.USR$PERFORMER
          LEFT JOIN GD_CONTACT creator ON creator.ID = deal.USR$CREATORKEY
        ORDER BY card.USR$MASTERKEY, USR$INDEX`
    },
    {
      name: 'tasks',
      query:
        `SELECT
          task.ID,
          task.USR$CARDKEY,
          task.USR$NAME,
          task.USR$CLOSED,
          task.USR$DEADLINE,
          task.USR$DATECLOSE,
          task.USR$CREATIONDATE,
          performer.ID AS PERFORMER_ID,
          performer.NAME AS PERFORMER_NAME,
          creator.ID AS CREATOR_ID,
          creator.NAME AS CREATOR_NAME
        FROM USR$CRM_KANBAN_CARD_TASKS task
        JOIN USR$CRM_KANBAN_CARDS card ON card.ID = task.USR$CARDKEY
        LEFT JOIN GD_CONTACT performer ON performer.ID = task.USR$PERFORMER
        LEFT JOIN GD_CONTACT creator ON creator.ID = task.USR$CREATORKEY`
    },
  ];

  const [rawColumns, rawCards, rawTasks] = await Promise.all(queries.map(execQuery));

  interface IMapOfArrays {
    [key: string]: any[];
  };

  const cards: IMapOfArrays = {};
  const tasks: IMapOfArrays = {};

  rawTasks.forEach(el => {
    const newTask = {
      ...el,
      // PERFORMER: {
      //   ID: el['PERFORMER_ID'],
      //   NAME: el['PERFORMER_NAME']
      // },
      // ...(el['CREATOR_ID'] && {
      //   CREATOR: {
      //     ID: el['CREATOR_ID'],
      //     NAME: el['CREATOR_NAME']
      //   }
      // }),
      PERFORMER: el['PERFORMER_ID']
        ? {
          ID: el['PERFORMER_ID'],
          NAME: el['PERFORMER_NAME']
        }
        : null,
      CREATOR: el['CREATOR_ID']
        ? {
          ID: el['CREATOR_ID'],
          NAME: el['CREATOR_NAME']
        }
        : null

    };

    if (tasks[el['USR$CARDKEY']]) {
      tasks[el['USR$CARDKEY']].push(newTask);
    } else {
      tasks[el['USR$CARDKEY']] = [newTask];
    };
  });

  rawCards.forEach(el => {
    const newCard = {
      ...el,
      DEAL: {
        ID: el['DEAL_ID'],
        USR$NAME: el['DEAL_USR$NAME'],
        USR$CONTACTKEY: el['DEAL_$CONTACTKEY'],
        USR$AMOUNT: el['DEAL_USR$AMOUNT'],
        USR$DEADLINE: el['USR$DEADLINE'],
        USR$SOURCE: el['USR$SOURCE'],
        CONTACT: {
          ID: el['CON_ID'],
          NAME: el['CON_NAME']
        },
        CREATOR: {
          ID: el['CREATOR_ID'],
          NAME: el['CREATOR_NAME']
        },
        PERFORMER: {
          ID: el['PERFORMER_ID'],
          NAME: el['PERFORMER_NAME']
        },
        USR$DONE: el['USR$DONE'] === 1,
        USR$READYTOWORK: el['USR$READYTOWORK'] === 1,
      },
      TASKS: tasks[el['ID']]
    };

    if (cards[el['USR$MASTERKEY']]) {
      cards[el['USR$MASTERKEY']].push(newCard);
    } else {
      cards[el['USR$MASTERKEY']] = [newCard];
    };
  });

  const columns = rawColumns.map(el => {
    return {
      ...el,
      CARDS: cards[el.ID] ?? []
    };
  });

  const result: IRequestResult = {
    queries: { columns },
    _schema
  };

  return res.status(200).json(result);
};

const reorderColumns: RequestHandler = async (req, res) => {
  const { attachment, transaction } = await startTransaction(req.sessionID);

  try {
    // const erModelFull = importERModel('TgdcDepartment');
    // const entites: IEntities = Object.fromEntries(Object.entries((await erModelFull).entities));

    // const allFields = [...new Set(entites['TgdcDepartment'].attributes.map(attr => attr.name))];

    const columns: IKanbanColumn[] = req.body;

    if (!columns.length) {
      return res.status(422).send(resultError('Нет данных'));
    }

    const allFields = ['ID', 'USR$INDEX'];
    const actualFields = allFields.filter(field => typeof columns[0][field] !== 'undefined');
    const actualFieldsNames = actualFields.join(',');
    const paramsString = actualFields.map(_ => '?').join(',');
    const returnFieldsNames = allFields.join(',');

    const sql = `
      UPDATE OR INSERT INTO USR$CRM_KANBAN_COLUMNS(${actualFieldsNames})
      VALUES(${paramsString})
      MATCHING(ID)
      RETURNING ${returnFieldsNames}`;

    const unresolvedPromises = columns.map(async column => {
      const paramsValues = actualFields.map(field => {
        return column[field];
      });

      return (await attachment.executeSingletonAsObject(transaction, sql, paramsValues));
    });

    const records = await Promise.all(unresolvedPromises);

    const result: IRequestResult<{ columns: IKanbanColumn[] }> = {
      queries: {
        columns: records as IKanbanColumn[]
      },
      _schema: undefined
    };

    await commitTransaction(req.sessionID, transaction);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).send(resultError(error.message));
  } finally {
    await releaseTransaction(req.sessionID, transaction);
  };
};

const reorderCards: RequestHandler = async (req, res) => {
  const { attachment, transaction } = await startTransaction(req.sessionID);

  try {
    // const erModelFull = importERModel('TgdcDepartment');
    // const entites: IEntities = Object.fromEntries(Object.entries((await erModelFull).entities));

    // const allFields = [...new Set(entites['TgdcDepartment'].attributes.map(attr => attr.name))];

    const cards: IKanbanCard[] = req.body;

    if (!cards.length) {
      // return res.status(422).send(resultError('Нет данных'));
      return res.status(204).send([]);
    };

    const allFields = ['ID', 'USR$INDEX'];
    const actualFields = allFields.filter(field => typeof cards[0][field] !== 'undefined');
    const actualFieldsNames = actualFields.join(',');
    const paramsString = actualFields.map(_ => '?').join(',');
    const returnFieldsNames = allFields.join(',');

    const sql = `
      UPDATE OR INSERT INTO USR$CRM_KANBAN_CARDS(${actualFieldsNames})
      VALUES(${paramsString})
      MATCHING(ID)
      RETURNING ${returnFieldsNames}`;

    const unresolvedPromises = cards.map(async card => {
      const paramsValues = actualFields.map(field => {
        return card[field];
      });

      return (await attachment.executeSingletonAsObject(transaction, sql, paramsValues));
    });

    const records = await Promise.all(unresolvedPromises);

    const result: IRequestResult<{ cards: IKanbanCard[] }> = {
      queries: {
        cards: records as IKanbanCard[]
      },
      _schema: undefined
    };

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).send(resultError(error.message));
  } finally {
    await commitTransaction(req.sessionID, transaction);
  };
};

export default { get, reorderColumns, reorderCards };
