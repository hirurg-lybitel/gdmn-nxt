import { IDataSchema, IRequestResult } from "@gsbelarus/util-api-types";
import { genPassword } from "@gsbelarus/util-helpers";
import { genRandomPassword } from "@gsbelarus/util-useful";
import { RequestHandler } from "express";
import { Client, Attachment, createNativeClient, getDefaultLibraryFilename, Transaction } from 'node-firebird-driver-native';
import { config } from "./db-config";
import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../../..' });

export const addAccount: RequestHandler = async (req, res) => {

  console.log(req.body);

  let { USR$FIRSTNAME, USR$LASTNAME, USR$POSITION, USR$PHONE, USR$EMAIL, USR$COMPANYKEY, USR$EXPIREON, USR$APPROVED } = req.body;

  const email = USR$EMAIL.trim().toLowerCase();
  let expireOn = USR$EXPIREON && new Date(USR$EXPIREON);
  let approved = USR$APPROVED;

  if (typeof USR$APPROVED === 'boolean') {
    approved = USR$APPROVED ? 1 : 0;
  }

  let client: Client;
  let attachment: Attachment;
  let transaction: Transaction;

  try {
    const { host, port, db } = config;
    client = createNativeClient(getDefaultLibraryFilename());
    attachment = await client.connect(`${host}/${port}:${db}`);
    transaction = await attachment.startTransaction();

    // purge expired records
    await attachment.execute(transaction, 'DELETE FROM usr$crm_account WHERE usr$expireon <= ?', [new Date()]);

    let id: number;

    const rs = await attachment.executeQuery(transaction, 'SELECT id FROM gd_p_getnextid');
    try {
      id = await rs.fetchAsObject()[0].id;
    } finally {
      await rs.close();
    }

    const provisionalPassword = genRandomPassword();
    const { salt, hash } = genPassword(provisionalPassword)

    // conversion to lower case is mandatory for email field
    // as we check uniquiness with index in the database
    await attachment.execute(transaction,
      `INSERT INTO usr$crm_account (id, usr$firstname, usr$lastname, usr$position, usr$phone, usr$email, usr$companykey, usr$approved, usr$expireon, usr$salt, usr$hash)
       VALUES                      (?,  ?,             ?,            ?,            ?,         ?,         ?,              ?,            ?,            ?,        ?`,
       [                            id, USR$FIRSTNAME, USR$LASTNAME, USR$POSITION, USR$PHONE, email,     USR$COMPANYKEY, approved,     expireOn,     salt,     hash]);

    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: 465,
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: '"GDMN System" <test@gsbelarus.com>',
        to: email,
        subject: "Account confirmation",
        text:
          `Please use following credentials to sign-in into your account at ...\
          \n\n\
          User name: ${email}\n\
          Password: ${provisionalPassword}
          \n\n\
          This temporary record will expire on ${new Date(expireOn).toLocaleDateString()}`
      });
    } catch (err) {
      console.error(err);
    }
  } finally {
    await transaction?.commit();
    await attachment?.disconnect();
    await client?.dispose();
  }

  return res.status(200);
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
            ${req.params.id ? 'WHERE Z.ID = ?' : req.params.email ? 'WHERE Z.USR$EMAIL = ?' : ''}`,
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