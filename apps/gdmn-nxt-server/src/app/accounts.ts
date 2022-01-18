import { IDataSchema, IRequestResult, IWithID } from "@gsbelarus/util-api-types";
import { genPassword } from "@gsbelarus/util-helpers";
import { genRandomPassword } from "@gsbelarus/util-useful";
import { RequestHandler } from "express";
import { closeConnection, setConnection } from "./db-connection";
import { sendEmail } from "./mail";

export const addAccount: RequestHandler = async (req, res) => {
  const { client, attachment, transaction} = await setConnection();

  try {
    let ID: number;
    let insert: boolean;

    if (parseInt(req.params['id']) > 0) {
      ID = parseInt(req.params['id']);
      insert = false;
    } else {
      const rs = await attachment.executeQuery(transaction, 'SELECT id FROM gd_p_getnextid');
      try {
        ID = (await rs.fetchAsObject<IWithID>())[0].ID;
        insert = true;
      } finally {
        await rs.close();
      }
    }

    const provisionalPassword = genRandomPassword();
    const { salt, hash } = genPassword(provisionalPassword);

    const allFields = ['ID', 'USR$FIRSTNAME', 'USR$LASTNAME', 'USR$POSITION', 'USR$PHONE', 'USR$EMAIL', 'USR$COMPANYKEY', 'USR$APPROVED', 'USR$EXPIREON', 'USR$SALT', 'USR$HASH'];
    const presentFields = allFields.filter( f => (typeof req.body[f] !== 'undefined') || (f === 'USR$SALT') || (f === 'USR$HASH') || (f === 'ID') );
    const fieldsNames = presentFields.join(',');
    const paramsString = presentFields.map( f => '?' ).join(',');
    const params = presentFields.map( f => {
      switch (f){
        case 'ID':
          return ID;

        case 'USR$SALT':
          return salt;

        case 'USR$HASH':
          return hash;

        case 'USR$EMAIL':
          return req.body['USR$EMAIL'].trim().toLowerCase();

        case 'USR$EXPIREON':
          return req.body['USR$EXPIREON'] === null ? null : new Date(req.body['USR$EXPIREON']);

        case 'USR$APPROVED': {
          const USR$APPROVED = req.body['USR$APPROVED'];
          if (typeof USR$APPROVED === 'boolean') {
            return USR$APPROVED ? 1 : 0;
          }
        }
      }

      return req.body[f];
    });
    const sql = `UPDATE OR INSERT INTO usr$crm_account (${fieldsNames}) VALUES (${paramsString}) MATCHING (ID) RETURNING ${fieldsNames}`;
    let row;
    row = await attachment.executeReturning(transaction, sql, params);

    const result: IRequestResult = {
      queries: {
        accounts: [Object.fromEntries( allFields.map( (f, idx) => ([f, row[idx]]) ) )]
      },
      _schema: undefined
    };

    res.json(result);

    const email = req.body['USR$EMAIL'];
    const expireOn = req.body['USR$EXPIREON'] && new Date(req.body['USR$EXPIREON']);

    if (email && expireOn) {
      try {
        await sendEmail(
          '"GDMN System" <test@gsbelarus.com>',
          email,
          "Account confirmation",
          `Please use following credentials to sign-in into your account at ...\
          \n\n\
          User name: ${email}\n\
          Password: ${provisionalPassword}
          \n\n\
          This temporary record will expire on ${expireOn.toLocaleDateString()}`
        );
      } catch (err) {
        console.error(err);
      }
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
        USR$EXPIREON: {
          type: 'timestamp'
        },
        USR$APPROVED: {
          type: 'boolean'
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