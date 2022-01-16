import { IRequestResult } from "@gsbelarus/util-api-types";
import { RequestHandler } from "express";
import { closeConnection, setConnection } from "./db-connection";

export const getContacts: RequestHandler = async (req, res) => {

  const { client, attachment, transaction } = await setConnection();

  try {
    const _schema = { };

    const execQuery = async ({ name, query, params }: { name: string, query: string, params?: any[] }) => {
      const rs = await attachment.executeQuery(transaction, query, params);
      try {
        const data = await rs.fetchAsObject();
        const sch = _schema[name];

        if (sch) {
          for (const rec of data) {
            for (const fld of Object.keys(rec)) {
              if (sch[fld] && sch[fld].type === 'date') {
                rec[fld] = (rec[fld] as Date).getTime();
              };
            }
          }
        }

        return [name, data];
      } finally {
        await rs.close();
      }
    };

    const getParams: any = (withKeys: boolean) => {
      const arr: Array<string | { [key: string]: string}> = [];
      req.params.taxId ?
        withKeys ? arr.push({ taxId: req.params.taxId}) : arr.push( req.params.taxId)
      : null;
      req.params.rootId ?
        withKeys ? arr.push({ rootId: req.params.rootId}) : arr.push( req.params.rootId)
      : null;

      return (arr?.length > 0 ? arr : undefined);
    };


    const queries = [
      {
        name: 'contacts',
        query: `
          SELECT
            c.id,
            IIF(COALESCE(c.name, '') = '', '<не указано>', c.name)  name,
            c.phone,
            p.id as parent,
            p.name as folderName
          FROM
            gd_contact c
            JOIN gd_contact p ON p.id = c.parent
            ${req.params.taxId ? 'JOIN gd_companycode cc ON cc.companykey = c.id AND cc.taxid = ?' : ''}
            ${req.params.rootId ? 'JOIN GD_CONTACT rootItem ON c.LB > rootItem.LB AND c.RB <= rootItem.RB AND rootItem.ID = ?' : ''}
          WHERE
            c.contacttype IN (2,3,5)`,
        params: getParams(false)
        //params: req.params.taxId ? [req.params.taxId] : undefined
      },
    ];

    const result: IRequestResult = {
      queries: {
        ...Object.fromEntries(await Promise.all(queries.map( q => execQuery(q) )))
      },
      _params: getParams(true),
      //_params: req.params.taxId ? [{ taxId: req.params.taxId }] : undefined,
      _schema
    };

    return res.json(result);
  } finally {
    await closeConnection(client, attachment, transaction);
  }
};

export const updateContact: RequestHandler = async (req, res) => {

  const { id } = req.params;
  const { NAME, PHONE } = req.body;
  const { client, attachment, transaction } = await setConnection();

  try {
    try {
      await attachment.execute(
        transaction,
        `UPDATE GD_CONTACT
         SET
           NAME = ?,
           PHONE = ?
         WHERE ID = ?`,
         [ NAME, PHONE, id ]
      );
    } catch (error) {
      return res.status(500).send({ "errorMessage": error.message });
    }

    const resultSet = await attachment.executeQuery(
      transaction,
      `SELECT
         con.ID,
         con.NAME,
         con.PHONE,
         par.NAME
       FROM GD_CONTACT con
       JOIN GD_CONTACT par ON par.ID = con.PARENT
       WHERE con.ID = ?`,
      [id]
    );

    const row = await resultSet.fetch();
    //const result2 = { ID: row[0][0], NAME: row[0][1], PHONE: row[0][2]}

    const _schema = { };

    const result: IRequestResult = {
      queries: {
        contact: [ { ID: row[0][0], NAME: row[0][1], PHONE: row[0][2], FOLDERNAME: row[0][3]} ]
      },
      _schema
    };

    //console.log('updateContact', result);

    await resultSet.close();

    return res.status(200).json(result);//send(result);

  } catch (error) {
      return res.status(500).send({ "errorMessage": error });

  } finally {
    await closeConnection(client, attachment, transaction);
  }
};

export const addContact: RequestHandler = async (req, res) => {

  const { NAME, PHONE, EMAIL } = req.body;
  const { client, attachment, transaction} = await setConnection();

  try {
    const resultSet = await attachment.executeQuery(
      transaction,
      `EXECUTE BLOCK(
        NAME  TYPE OF COLUMN GD_CONTACT.NAME = ?,
        EMAIL TYPE OF COLUMN GD_CONTACT.EMAIL = ?,
        PHONE TYPE OF COLUMN GD_CONTACT.PHONE = ?
      )
      RETURNS(
        ret_ID    INTEGER,
        ret_NAME  TYPE OF COLUMN GD_CONTACT.NAME,
        ret_EMAIL TYPE OF COLUMN GD_CONTACT.EMAIL,
        ret_PHONE TYPE OF COLUMN GD_CONTACT.PHONE,
        ret_FOLDERNAME TYPE OF COLUMN GD_CONTACT.NAME
      )
      AS
      DECLARE VARIABLE PARENT TYPE OF COLUMN GD_CONTACT.PARENT;
      BEGIN
        INSERT INTO GD_CONTACT(CONTACTTYPE, PARENT, NAME, PHONE, EMAIL)
        VALUES(3, (SELECT ID FROM GD_RUID WHERE XID = 147002208 AND DBID = 31587988 ROWS 1), :NAME, :PHONE, :EMAIL)
        RETURNING ID, PARENT, NAME, PHONE, EMAIL INTO :ret_ID, :PARENT, :ret_NAME, :ret_PHONE, :ret_EMAIL;

        SELECT NAME FROM GD_CONTACT WHERE ID = :PARENT
        INTO :ret_FOLDERNAME;

        IF (ret_ID IS NOT NULL) THEN
          INSERT INTO GD_COMPANY(CONTACTKEY)
          VALUES(:ret_ID);

        IF (ret_ID IS NOT NULL) THEN
          INSERT INTO GD_COMPANYCODE(COMPANYKEY)
          VALUES(:ret_ID);

        SUSPEND;
      END`,
      [ NAME, PHONE, EMAIL ]
    );

    const _schema = {}
    const rows = await resultSet.fetch();

    const result: IRequestResult = {
      queries: {
        contact: [ { ID: rows[0][0], NAME: rows[0][1], PHONE: rows[0][2], EMAIL: rows[0][3], FOLDERNAME: rows[0][4] } ]
      },
      _schema
    };

    await resultSet.close();

    return res.status(200).json(result);//send(result);

  } catch (error) {

      console.log('addContact_error', error.message);
      return res.status(500).send({ "errorMessage": error.message});

  } finally {
    await closeConnection(client, attachment, transaction);
  };
};


export const deleteContact: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const { client, attachment, transaction} = await setConnection();

  try {
    await attachment.execute(
      transaction,
      `EXECUTE BLOCK(
        ID INTEGER = ?
      )
      AS
      BEGIN
        DELETE FROM GD_COMPANYCODE WHERE COMPANYKEY = :ID;
        DELETE FROM GD_COMPANY WHERE CONTACTKEY = :ID;
        DELETE FROM GD_CONTACT WHERE ID = :ID;
      END`,
      [ id ]
    );

    return res.status(200).send(id);

  } catch (error) {
    return res.status(500).send({ "errorMessage": error.message});
  } finally {
    await closeConnection(client, attachment, transaction);
  }
};



export const getContactHierarchy : RequestHandler = async (req, res) => {

  const { client, attachment, transaction } = await setConnection();

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
        name: 'hierarchy',
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

    return res.json(result);
  } finally {
    await closeConnection(client, attachment, transaction);
  }
};
