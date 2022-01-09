import { IDataSchema, IRequestResult } from "@gsbelarus/util-api-types";
import { RequestHandler } from "express";
import { Client, Attachment, createNativeClient, getDefaultLibraryFilename, Transaction } from 'node-firebird-driver-native';
import { config } from "./db-config";

export const addAccount: RequestHandler = async (req, res) => {

  let { firstName, lastName, position, phone, email, companykey, approved, expireOn } = req.body;

  if (typeof expireOn === 'number') {
    expireOn = new Date(expireOn);
  }

  if (typeof approved === 'boolean') {
    approved = approved ? 1 : 0;
  }

  let client: Client;
  let attachment: Attachment;
  let transaction: Transaction;

  try {
    const { host, port, db } = config;
    client = createNativeClient(getDefaultLibraryFilename());
    attachment = await client.connect(`${host}/${port}:${db}`);
    transaction = await attachment.startTransaction();

    let id: number;

    const rs = await attachment.executeQuery(transaction, 'SELECT id FROM gd_p_getnextid');
    try {
      id = await rs.fetchAsObject()[0].id;
    } finally {
      await rs.close();
    }

    await attachment.execute(transaction,
      `INSERT INTO usr$crm_account (id, usr$firstname, usr$lastname, usr$postion, usr$phone, usr$email, usr$companykey, usr$approved, usr$expireon)
       VALUES                      (?,  ?,             ?,            ?,           ?,         ?,         ?,              ?,            ?`,
       [                            id, firstName,     lastName,     position,    phone,     email,     companykey,     approved,     expireOn]);

    return res.status(200);
  } finally {
    await transaction?.commit();
    await attachment?.disconnect();
    await client?.dispose();
  }
};

export const getAccounts: RequestHandler = async (req, res) => {

  let client: Client;
  let attachment: Attachment;
  let transaction: Transaction;

  try {
    const { host, port, db } = config;
    client = createNativeClient(getDefaultLibraryFilename());
    attachment = await client.connect(`${host}/${port}:${db}`);
    transaction = await attachment.startTransaction();

    const _schema: IDataSchema = {
      accounts: {
        EXPIREON: {
          type: 'timestamp'
        }
      }
    };

    const execQuery = async ({ name, query, params }: { name: string, query: string, params?: any[] }) => {
      const rs = await attachment.executeQuery(transaction, query, params);
      try {
        const data = await rs.fetchAsObject();
        const sch = _schema[name];

        if (sch) {
          for (const rec of data) {
            for (const fld of Object.keys(rec)) {
              if (sch[fld]?.type === 'date' || sch[fld]?.type === 'timestamp') {
                rec[fld] = (rec[fld] as Date).getTime();
              }
            }
          }
        }

        return [name, data];
      } finally {
        await rs.close();
      }
    };

    const queries = [
      {
        name: 'accounts',
        query: `
          SELECT
            Z.ID,
            Z.EDITIONDATE,
            Z.USR$EXPIREON,
            Z.USR$APPROVED,
            Z.USR$COMPANYKEY,
            C.NAME AS COMPANYNAME,
            Z.USR$POSITION,
            Z.USR$LASTNAME,
            Z.USR$FIRSTNAME,
            Z.USR$PHONE,
            Z.USR$EMAIL

          FROM
            USR$CRM_ACCOUNT Z
              LEFT JOIN
                GD_COMPANY Z_USR$COMPANYKEY
              ON
                Z_USR$COMPANYKEY.CONTACTKEY  =  Z.USR$COMPANYKEY
              LEFT JOIN
                GD_CONTACT C
              ON
                Z_USR$COMPANYKEY.CONTACTKEY  =  C.ID
            ${req.params.id ? 'WHERE Z.ID = ?' : req.params.email ? 'WHERE Z.EMAIL = ?' : ''}`,
        params: req.params.id ? [req.params.id] : req.params.email ? [req.params.email] : undefined
      },
    ];

    const result: IRequestResult = {
      queries: {
        ...Object.fromEntries(await Promise.all(queries.map( q => execQuery(q) )))
      },
      _params: req.params.email ? [{ email: req.params.email }] : undefined,
      _schema
    };

    return res.json(result);
  } finally {
    await transaction?.commit();
    await attachment?.disconnect();
    await client?.dispose();
  }
};