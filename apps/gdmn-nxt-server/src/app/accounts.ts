import { IDataSchema, IRequestResult, IWithID } from "@gsbelarus/util-api-types";
import { genPassword } from "@gsbelarus/util-helpers";
import { genRandomPassword } from "@gsbelarus/util-useful";
import { RequestHandler } from "express";
import { closeConnection, setConnection } from "./db-connection";
import { sendEmail } from "./mail";

export const addAccount: RequestHandler = async (req, res) => {
  const { client, attachment, transaction} = await setConnection();

  let { USR$FIRSTNAME, USR$LASTNAME, USR$POSITION, USR$PHONE, USR$EMAIL, USR$COMPANYKEY, USR$EXPIREON, USR$APPROVED } = req.body;

  const email = USR$EMAIL.trim().toLowerCase();
  let expireOn = USR$EXPIREON && new Date(USR$EXPIREON);
  let approved = USR$APPROVED;

  if (typeof USR$APPROVED === 'boolean') {
    approved = USR$APPROVED ? 1 : 0;
  }

  try {
    // purge expired records
    await attachment.execute(transaction, 'DELETE FROM usr$crm_account WHERE usr$expireon <= ?', [new Date()]);

    let ID: number;

    const rs = await attachment.executeQuery(transaction, 'SELECT id FROM gd_p_getnextid');
    try {
      ID = (await rs.fetchAsObject<IWithID>())[0].ID;
    } finally {
      await rs.close();
    }

    const provisionalPassword = genRandomPassword();
    const { salt, hash } = genPassword(provisionalPassword);

    // conversion to lower case is mandatory for email field
    // as we check uniquiness with index in the database
    const fields = ['ID', 'USR$FIRSTNAME', 'USR$LASTNAME', 'USR$POSITION', 'USR$PHONE', 'USR$EMAIL', 'USR$COMPANYKEY', 'USR$APPROVED', 'USR$EXPIREON', 'USR$SALT', 'USR$HASH'];
    const fields_string = fields.join(',');
    const params_string = fields.map( f => '?' ).join(',');
    const sql = `INSERT INTO usr$crm_account (${fields_string}) VALUES (${params_string}) RETURNING ${fields_string}`;
    let row;
    row = await attachment.executeReturning(transaction, sql,
      [ID, USR$FIRSTNAME, USR$LASTNAME, USR$POSITION, USR$PHONE, email, USR$COMPANYKEY, approved, expireOn, salt, hash]);

    const result: IRequestResult = {
      queries: {
        accounts: [Object.fromEntries( fields.map( (f, idx) => ([f, row[idx]]) ) )]
      },
      _schema: undefined
    };

    res.json(result);

    try {
      await sendEmail(
        '"GDMN System" <test@gsbelarus.com>',
        email,
        "Account confirmation",
        `Please use following credentials to sign-in into your account at ...\
        \n\n\
        User name: ${USR$EMAIL}\n\
        Password: ${provisionalPassword}
        \n\n\
        This temporary record will expire on ${new Date(expireOn).toLocaleDateString()}`
      );
    } catch (err) {
      console.error(err);
    }
  } finally {
    await closeConnection(client, attachment, transaction);
  }
};

export const getAccounts: RequestHandler = async (req, res) => {
  const { client, attachment, transaction} = await setConnection();

  try {
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
    await closeConnection(client, attachment, transaction);
  }
};