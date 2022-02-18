import { ILabelsContact, IRequestResult } from "@gsbelarus/util-api-types";
import { RequestHandler } from "express";
import { getReadTransaction, releaseReadTransaction, releaseTransaction, startTransaction } from "./utils/db-connection";

export const getContacts: RequestHandler = async (req, res) => {

  const { attachment, transaction } = await getReadTransaction(req.sessionID);

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
            c.email,
            p.id as parent,
            p.name as folderName,
            null as labels
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
    await releaseReadTransaction(req.sessionID);
  }
};

export const updateContact: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const { NAME, PHONE, EMAIL, PARENT } = req.body;
  const { attachment, transaction } = await startTransaction(req.sessionID);

  try {
    try {
      await attachment.execute(
        transaction,
        `UPDATE GD_CONTACT
         SET
           NAME = ?,
           PHONE = ?,
           EMAIL = ?,
           PARENT = ?
         WHERE ID = ?`,
         [ NAME, PHONE, EMAIL, PARENT, id ]
      );
    } catch (error) {
      return res.status(500).send({ "errorMessage": error.message });
    }

    const resultSet = await attachment.executeQuery(
      transaction,
      `SELECT
         con.ID,
         con.PARENT,
         con.NAME,
         con.EMAIL,
         con.PHONE,
         par.NAME
       FROM GD_CONTACT con
       JOIN GD_CONTACT par ON par.ID = con.PARENT
       WHERE con.ID = ?`,
      [id]
    );

    const row = await resultSet.fetch();

    const _schema = { };

    const result: IRequestResult = {
      queries: {
        contact: [ {
          ID: row[0][0],
          PARENT: row[0][1],
          NAME: row[0][2],
          EMAIL: row[0][3],
          PHONE: row[0][4],
          FOLDERNAME: row[0][5]
        } ]
      },
      _schema
    };

    await resultSet.close();
    await transaction.commit();

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).send({ "errorMessage": error });
  } finally {
    await releaseTransaction(req.sessionID, transaction);
  }
};

export const addContact: RequestHandler = async (req, res) => {

  const { NAME, PHONE, EMAIL, PARENT, labels } = req.body;
  const { attachment, transaction} = await startTransaction(req.sessionID);

  try {
    const resultSet = await attachment.executeQuery(
      transaction,
      `EXECUTE BLOCK(
        NAME  TYPE OF COLUMN GD_CONTACT.NAME = ?,
        EMAIL TYPE OF COLUMN GD_CONTACT.EMAIL = ?,
        PHONE TYPE OF COLUMN GD_CONTACT.PHONE = ?,
        PARENT TYPE OF COLUMN GD_CONTACT.PARENT = ?
      )
      RETURNS(
        ret_ID    INTEGER,
        ret_NAME  TYPE OF COLUMN GD_CONTACT.NAME,
        ret_EMAIL TYPE OF COLUMN GD_CONTACT.EMAIL,
        ret_PHONE TYPE OF COLUMN GD_CONTACT.PHONE,
        ret_PARENT TYPE OF COLUMN GD_CONTACT.PARENT,
        ret_FOLDERNAME TYPE OF COLUMN GD_CONTACT.NAME
      )
      AS
      BEGIN
        INSERT INTO GD_CONTACT(CONTACTTYPE, PARENT, NAME, PHONE, EMAIL)
        VALUES(3, IIF(:PARENT IS NULL, (SELECT ID FROM GD_RUID WHERE XID = 147002208 AND DBID = 31587988 ROWS 1), :PARENT), :NAME, :PHONE, :EMAIL)
        RETURNING ID, PARENT, NAME, PHONE, EMAIL
        INTO :ret_ID, :ret_PARENT, :ret_NAME, :ret_PHONE, :ret_EMAIL;

        SELECT NAME FROM GD_CONTACT WHERE ID = :ret_PARENT
        INTO :ret_FOLDERNAME;

        IF (ret_ID IS NOT NULL) THEN
          INSERT INTO GD_COMPANY(CONTACTKEY)
          VALUES(:ret_ID);

        IF (ret_ID IS NOT NULL) THEN
          INSERT INTO GD_COMPANYCODE(COMPANYKEY)
          VALUES(:ret_ID);

        SUSPEND;
      END`,
      [ NAME, EMAIL, PHONE, PARENT ]
    );

    const _schema = {}
    const rows = await resultSet.fetch();

    await resultSet.close();

    const row = rows[0];
    // console.log('rows', rows);

    // const rec = await upsertLabels({ attachment, transaction}, row[0], labels);
    // console.log('rec', rec);

    const result: IRequestResult = {
      queries: {
        contact: [ {
          ID: row[0],
          NAME: row[1],
          EMAIL: row[2],
          PHONE: row[3],
          PARENT: row[4],
          FOLDERNAME: row[5],
          labels: await upsertLabels({ attachment, transaction}, row[0], labels)
        } ]
      },
      _schema
    };

    await transaction.commit();

    return res.status(200).json(result);
  } catch (error) {
      console.log('addContact_error', error.message);
      return res.status(500).send({ "errorMessage": error.message});
  } finally {
    await releaseTransaction(req.sessionID, transaction);
  };
};

export const deleteContact: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const { attachment, transaction} = await startTransaction(req.sessionID);

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

    await transaction.commit();
    return res.status(200).send(id);
  } catch (error) {
    return res.status(500).send({ "errorMessage": error.message});
  } finally {
    await releaseTransaction(req.sessionID, transaction);
  }
};

export const getContactHierarchy : RequestHandler = async (req, res) => {
  const { attachment, transaction } = await getReadTransaction(req.sessionID);
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
    await releaseReadTransaction(req.sessionID);
  }
};

const upsertLabels = async(firebirdPropsL: any, contactId: number, labels: ILabelsContact[]): Promise<ILabelsContact[]> => {
  if (labels.length === 0) {
    return;
  };

  const newLabels = labels.map(label => ({...label, CONTACT: contactId}))

  const {attachment, transaction} = firebirdPropsL;

  try {
    /** Поскольку мы передаём весь массив лейблов, то удалим все прежние  */
    const deleteSQL = `DELETE FROM USR$CRM_CONTACT_LABELS WHERE USR$CONTACTKEY = ?`;

    await Promise.all(
      [...new Set(newLabels.map(el => el.CONTACT))]
        .map(async label => {
        await attachment.execute(transaction, deleteSQL, [label]);
        })
    );

      const insertSQL = `
        EXECUTE BLOCK(
          ID TYPE OF COLUMN USR$CRM_CONTACT_LABELS.ID = ?,
          CONTACTKEY TYPE OF COLUMN USR$CRM_CONTACT_LABELS.USR$CONTACTKEY = ?,
          LABELKEY TYPE OF COLUMN USR$CRM_CONTACT_LABELS.USR$LABELKEY = ?
        )
        RETURNS(
          res_ID TYPE OF COLUMN USR$CRM_CONTACT_LABELS.ID,
          res_CONTACTKEY TYPE OF COLUMN USR$CRM_CONTACT_LABELS.USR$CONTACTKEY,
          res_LABELKEY TYPE OF COLUMN USR$CRM_CONTACT_LABELS.USR$LABELKEY
        )

        AS
        BEGIN
          DELETE FROM USR$CRM_CONTACT_LABELS WHERE ID = :ID;

          INSERT INTO USR$CRM_CONTACT_LABELS(USR$CONTACTKEY, USR$LABELKEY)
          VALUES(:CONTACTKEY, :LABELKEY)
          RETURNING ID, USR$CONTACTKEY, USR$LABELKEY INTO :res_ID, :res_CONTACTKEY, :res_LABELKEY;

          SUSPEND;
        END`;

      const records = await Promise.all(newLabels.map(async label => {
        return (await attachment.executeReturningAsObject(transaction, insertSQL, Object.values(label)));
      }));

      return records as ILabelsContact[];
    } catch (error) {

      console.log('catch', error);

      return;
  } finally {
    //await closeConnection(client, attachment, transaction);
  };
};
