import { IEntities, IKanbanCard, IKanbanColumn, IRequestResult } from "@gsbelarus/util-api-types";
import { RequestHandler } from "express";
import { ResultSet } from "node-firebird-driver-native";
import { importModels } from "../er/er-utils";
import { resultError } from "../responseMessages";
import { commitTransaction, getReadTransaction, releaseReadTransaction, releaseTransaction, startTransaction } from "../utils/db-connection";

const get: RequestHandler = async (req, res) => {
  const { mode } = req.params;

  const { attachment, transaction } = await getReadTransaction(req.sessionID);

  // await new Promise((res) => setTimeout(res, 5000));

  let cardsData = '';
  switch (mode) {
    case 'deals':
      cardsData = `
      JOIN USR$CRM_DEALS deal ON deal.ID = card.USR$DEALKEY`
      break;

    default:
      break;
  }

  try {
    const _schema = { };

    let allFields = ['ID', 'EDITIONDATE', 'USR$INDEX', 'USR$NAME'];
    let actualFields = ['ID', 'USR$INDEX', 'USR$NAME'];
    let actualFieldsNames = actualFields.join(',');

    const columnsResultSet = await attachment.executeQuery(
      transaction,
      `SELECT ${actualFieldsNames}
      FROM USR$CRM_KANBAN_COLUMNS
      ORDER BY USR$INDEX`
    );


    let cardsResultSet;
    switch (mode) {
      case 'deals':
        cardsResultSet = await attachment.executeQuery(
          transaction,
          `SELECT
            card.ID, COALESCE(card.USR$INDEX, 0) USR$INDEX, card.USR$MASTERKEY,
            card.USR$DEALKEY, deal.ID deal_ID, deal.USR$NAME deal_USR$NAME, deal.USR$DISABLED deal_USR$DISABLED, deal.USR$AMOUNT deal_USR$AMOUNT, deal.USR$CONTACTKEY deal_USR$CONTACTKEY,
            con.ID con_ID, con.NAME con_NAME
          FROM USR$CRM_KANBAN_CARDS card
          JOIN USR$CRM_DEALS deal ON deal.ID = card.USR$DEALKEY
          JOIN GD_CONTACT con ON con.ID = deal.USR$CONTACTKEY
          ORDER BY card.USR$MASTERKEY, USR$INDEX`
        );

        break;

      default:
        actualFields = ['ID', 'USR$MASTERKEY', 'USR$INDEX', 'USR$DEALKEY'];
        actualFieldsNames = actualFields.join(',');

        cardsResultSet = await attachment.executeQuery(
          transaction,
          `SELECT ${actualFieldsNames}
          FROM USR$CRM_KANBAN_CARDS card
          ORDER BY USR$INDEX`
        );

        break;
    }

    interface ISubItemArray {
      itemName: string;
      itemResultSet: ResultSet;
      itemMasterField?: string;
      itemDetailField: string;
      subItemArray?: ISubItemArray[];
    };

    const execQuery = async (resultSet: ResultSet, itemArray?: ISubItemArray[]) => {
      const data = await resultSet.fetchAsObject();

      if (itemArray) {
      for (const item of itemArray) {
        const itemData = await Promise.all(await execQuery(item.itemResultSet));

        let itemData2: any[];
        switch (mode) {
          case 'deals':
            itemData.map((el: IKanbanCard)  => {
              el.DEAL = {
                ID: el['DEAL_ID'],
                USR$NAME: el['DEAL_USR$NAME'],
                USR$CONTACTKEY: el['DEAL_$CONTACTKEY'],
                USR$AMOUNT: el['DEAL_USR$AMOUNT'],
                CONTACT: {
                  ID: el['CON_ID'],
                  NAME: el['CON_NAME']
                },
              }
              return el;
            });

            break;

          default:
            break;
        };

      //   const foonction = (obj: Type1): Type2 => {
      //     let res = <Type2>{};
      //     Object.keys(obj).forEach(key => res[key as keyof Type2] = obj[key as keyof Type1] != 0);  // Do your mapping here
      //     return res;
      // }

        data.map((el) => {

          // const cards: IKanbanCard[] = itemData.filter((e: any) => {



          //   let card = <IKanbanCard>{};
          //   Object.keys(e).forEach(key => {
          //     //type k = keyof IKanbanCard;

          //     let o = {};

          //     e && Object.assign(o as IKanbanCard, e as IKanbanCard);

          //     //console.log('o', o);

          //     type k3 = { [key in keyof IKanbanCard]: boolean }

          //     Object.keys(o).forEach((key: k3) => {

          //       console.log('card', `${key}:  ${e[key as keyof IKanbanCard]}`)
          //     })






          //     let obj: k3;

          //     //const ff = Object.keys(obj);

          //     //console.log('ff');

          //     for (const key in obj) {
          //       console.log('card', card);
          //       if (e.hasOwnProperty(key)) {
          //         card[key] = e[key];
          //         console.log('card', card);
          //       }
          //     }
          //     // console.log('obj', k3);

          //     // for (const key as k in e) {
          //     //   if (e.hasOwnProperty(k2)) {
          //     //     const element = e[key];
          //     //     card[k2] = e[k2]

          //     //   }
          //     // }




          //     // if (key typeof k) {

          //     // }

          //     return card[key as keyof IKanbanCard] = e[key]
          //   } );

          //   //card[key as keyof IKanbanCard] = e[key]

          //   //console.log('card', card);

          //   return e[item.itemDetailField] === el[item.itemMasterField ? item.itemMasterField  : 'ID']
          // }) as IKanbanCard[];



          return el[item.itemName] = itemData?.filter((e: IKanbanCard) => e[item.itemDetailField] === el[item.itemMasterField ? item.itemMasterField  : 'ID']) as IKanbanCard[]
        });
      }
    }

      resultSet.close();
      return data;
    };

    // const rs = await Promise.all(await execQuery(columnsResultSet));
    // console.log('rs', rs);


    const itemArray: ISubItemArray[] = [
      {
        itemName: 'CARDS',
        itemResultSet: cardsResultSet,
        itemDetailField: 'USR$MASTERKEY',
        // subItemArray: [{
        //   itemName: 'DEAL',
        //   itemResultSet: dealsResultSet,
        //   itemMasterField: 'USR$DEALKEY',
        //   itemDetailField: 'ID',
        //   subItemArray: [{
        //     itemName: 'CONTACT',
        //     itemResultSet: contactResultSet,
        //     itemMasterField: 'USR$CONTACTKEY',
        //     itemDetailField: 'ID',
        //   }]
        // }]
      }
    ];

    const result: IRequestResult = {
      queries: {
        columns: await Promise.all(await execQuery(columnsResultSet, itemArray)) //await columnsResultSet.fetchAsObject()
      },
      _schema
    };

    transaction.commit();


    return res.status(200).json(result);

    // await columnsResult.fetchAsObject();
    // await cardsResult.fetchAsObject();
    // await dealsResult.fetchAsObject();
    // await contactResult.fetchAsObject();


    // console.log('columnsResult',await columnsResult.fetchAsObject());
    // console.log('cardsResult',await cardsResult.fetchAsObject());

    // return res.status(200).send(await columnsResult.fetchAsObject());

    //const erModelFull = (await importERModel('TgdcAttrUserDefinedUSR_CRM_KANBAN_COLUMNS')).entities;
    //const entites: IEntities = Object.fromEntries(Object.entries((await erModelFull).entities));
    //const entites2 = (await erModelFull).entities;

    //console.log('erModelFull', entites);

    //return res.status(200).json(erModelFull);

    // const allFields = [...new Set(entites['TgdcAttrUserDefinedUSR_CRM_KANBAN_COLUMNS'].attributes.map(attr => attr.name))];
    // const returnFieldsNames = allFields.join(',');



    // const paramsValues = actualFields.map(field => {
    //   return req.body[field];
    // })

    // if (isInsertMode) {
    //   const requiredFields = {
    //     ID: ID,
    //     CONTACTTYPE: 4,
    //     USR$ISOTDEL: 1,
    //     PARENT: null
    //   }

    //   for (const [key, value] of Object.entries(requiredFields)) {
    //     if (!actualFields.includes(key)) {
    //       actualFields.push(key);
    //       paramsValues.push(value)
    //     }
    //   }
    // };

    // //const actualFieldsNames = actualFields.join(',');
    // const paramsString = actualFields.map( _ => '?' ).join(',');
    // const returnFieldsNames = allFields.join(',');

    // const execQuery = async ({ name, query, params }: { name: string, query: string, params?: any[] }) => {
    //   const rs = await attachment.executeQuery(transaction, query, params);
    //   try {
    //     const data = await rs.fetchAsObject();
    //     const sch = _schema[name];

    //     return [name, data];
    //   } finally {
    //     await rs.close();
    //   }
    // };

    // const queries = [
    //   {
    //     name: 'departments',
    //     query: `
    //       SELECT
    //         *
    //       FROM
    //       AT_RELATIONS `,
    //     params: id ? [id] : undefined,
    //   },
    // ];

    // const result: IRequestResult = {
    //   queries: {
    //     ...Object.fromEntries(await Promise.all(queries.map( q => execQuery(q) )))
    //   },
    //   _params: id ? [{ id: id }] : undefined,
    //   _schema
    // };

    // return res.status(200).json(result);
  } catch(error) {

    return res.status(500).send(resultError(error.message));
  }finally {
    await releaseReadTransaction(req.sessionID);
  }
  const myheader = req.get('myheader');


  return res.status(200).send('columns' + myheader);
};

const reorderColumns: RequestHandler = async (req, res) => {
  const { attachment, transaction } = await startTransaction(req.sessionID);

  try {
    // const erModelFull = importERModel('TgdcDepartment');
    // const entites: IEntities = Object.fromEntries(Object.entries((await erModelFull).entities));

    // const allFields = [...new Set(entites['TgdcDepartment'].attributes.map(attr => attr.name))];

    const columns: IKanbanColumn[] = req.body;

    if (!columns.length) {
      return res.status(422).send(resultError(`Нет данных`));
    }

    const allFields = ['ID', 'USR$INDEX']
    const actualFields = allFields.filter( field => typeof columns[0][field] !== 'undefined' );
    const actualFieldsNames = actualFields.join(',');
    const paramsString = actualFields.map( _ => '?' ).join(',');
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

    await commitTransaction(req.sessionID, transaction)

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
      return res.status(422).send(resultError(`Нет данных`));
    }

    const allFields = ['ID', 'USR$INDEX']
    const actualFields = allFields.filter( field => typeof cards[0][field] !== 'undefined' );
    const actualFieldsNames = actualFields.join(',');
    const paramsString = actualFields.map( _ => '?' ).join(',');
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

    await commitTransaction(req.sessionID, transaction)

    return res.status(200).json(result);

  } catch (error) {
    return res.status(500).send(resultError(error.message));
  } finally {
    await releaseTransaction(req.sessionID, transaction);
  };

};

export default { get, reorderColumns, reorderCards };
