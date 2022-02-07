import { IDataSchema, IRequestResult } from "@gsbelarus/util-api-types";
import { RequestHandler } from "express";
import { ResultSet } from "node-firebird-driver-native";
import { closeConnection, setConnection } from "./db-connection";
import { resultError } from "./responseMessages";

const get: RequestHandler = async (req, res)  => {

  const { attachment, transaction } = await setConnection();

  try {
    const _schema = { };

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
        name: 'groups',
        query: `
          SELECT
            z.ID,
            z.LB,
            z.RB,
            z.PARENT,
            z.NAME
          FROM
            GD_CONTACT z
          WHERE
            Z.CONTACTTYPE  =  0`
      },
    ];

    const result: IRequestResult = {
      queries: {
        ...Object.fromEntries(await Promise.all(queries.map( q => execQuery(q) )))
      },
      _schema
    };

    await transaction.commit()

    //return res.status(500).json(resultError('my test error message for get query'));
    return res.status(200).json(result);
  } catch(error) {

    return res.status(500).send(resultError(error.message));
  }finally {
    await closeConnection(attachment, transaction);
  }
};


const add: RequestHandler = async(req, res) => {

  const {NAME} = req.body;
  let {PARENT = null} = req.body;

  if (!NAME) {
    return res.status(422).send(resultError('Отсутсвует наименование'))
  }

  if (PARENT === 0) PARENT = null;

  const { attachment, transaction} = await setConnection();

  try {

    const _schema = {};

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
        name: 'groups',
        query:
          `EXECUTE BLOCK(
            input_NAME  TYPE OF COLUMN GD_CONTACT.NAME = ?,
            input_PARENT TYPE OF COLUMN GD_CONTACT.PARENT = ?
          )
          RETURNS(
            ID    INTEGER,
            NAME  TYPE OF COLUMN GD_CONTACT.NAME,
            LB    TYPE OF COLUMN GD_CONTACT.LB,
            RB    TYPE OF COLUMN GD_CONTACT.RB,
            PARENT TYPE OF COLUMN GD_CONTACT.PARENT
          )
          AS
          BEGIN
            INSERT INTO GD_CONTACT(CONTACTTYPE, PARENT, NAME)
            VALUES(0, :input_PARENT, :input_NAME)
            RETURNING ID, PARENT, NAME, LB, RB
            INTO :ID, :PARENT, :NAME, :LB, :RB;

            SUSPEND;
          END`,
        params: [NAME, PARENT]
      },
    ];

    const result: IRequestResult = {
      queries: {
        ...Object.fromEntries(await Promise.all(queries.map( q => execQuery(q) )))
      },
      _schema
    };

    await transaction.commit();

    return res.status(200).json(result);

  } catch (error) {
      return res.status(500).send(resultError(error.message));

  } finally {
    await closeConnection(attachment, transaction);
  };

}

const update: RequestHandler = async(req, res) => {

  const { id } = req.params;
  const {NAME} = req.body;
  let {PARENT = null} = req.body;

  if (!NAME) {
    return res.status(422).send(resultError('Отсутсвует наименование'))
  }

  if (PARENT === 0) PARENT = null;

  const { attachment, transaction } = await setConnection();

  try {

    const _schema: IDataSchema = {
    };

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
        name: 'groups',
        query:
          `EXECUTE BLOCK(
            input_ID      TYPE OF COLUMN GD_CONTACT.ID = ?,
            input_NAME    TYPE OF COLUMN GD_CONTACT.NAME = ?,
            input_PARENT  TYPE OF COLUMN GD_CONTACT.PARENT = ?
          )
          RETURNS(
            ID    INTEGER,
            NAME  TYPE OF COLUMN GD_CONTACT.NAME,
            LB    TYPE OF COLUMN GD_CONTACT.LB,
            RB    TYPE OF COLUMN GD_CONTACT.RB,
            PARENT TYPE OF COLUMN GD_CONTACT.PARENT
          )
          AS
          BEGIN
            UPDATE GD_CONTACT
            SET
              NAME = :input_NAME,
              PARENT = :input_PARENT
            WHERE
              ID = :input_ID
            RETURNING ID, PARENT, NAME, LB, RB INTO :ID, :PARENT, :NAME, :LB, :RB;

            SUSPEND;
          END`,
        params: [id, NAME, PARENT]
      },
    ];

    const result: IRequestResult = {
      queries: {
        ...Object.fromEntries(await Promise.all(queries.map( q => execQuery(q) )))
      },
      _params: [{id: id, body: req.body}],
      _schema
    };

    await transaction.commit();

    //return res.status(500).json(resultError('my test error message'));
    return res.status(200).json(result);

  } catch (error) {
    return res.status(500).send(resultError(error.message));

  } finally {
    await closeConnection(attachment, transaction);
  }

}

const remove: RequestHandler = async(req, res) => {
  const { id } = req.params;
  const {attachment, transaction} = await setConnection();

  let result: ResultSet;
  try {
      result = await attachment.executeQuery(
      transaction,
      `EXECUTE BLOCK(
        ID INTEGER = ?
      )
      RETURNS(SUCCESS BOOLEAN)
      AS
      BEGIN
        SUCCESS = FALSE;
        FOR SELECT ID FROM GD_CONTACT WHERE ID = :ID AS CURSOR curCONTACT
        DO
        BEGIN
          DELETE FROM GD_CONTACT WHERE CURRENT OF curCONTACT;

          SUCCESS = TRUE;
        END

        SUSPEND;
      END`,
      [ id ]
    );

    const data: {SUCCESS: boolean}[] = await result.fetchAsObject();

    if (!data[0].SUCCESS) {
      return res.status(500).send(resultError('Объект не найден'))
    }


    await transaction.commit();

    return res.status(200).json({'id': id});
  } catch (error) {
    return res.status(500).send(resultError(error.message));
  } finally {

    await result.close()
    await closeConnection(attachment, transaction);
  }

};

export default {get, add, update, remove};
