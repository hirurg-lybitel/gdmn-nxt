import { IRequestResult } from "@gsbelarus/util-api-types";
import { RequestHandler } from "express";
import { Client, Attachment, createNativeClient, getDefaultLibraryFilename, Transaction } from 'node-firebird-driver-native';
import { config } from "./db-config";

export const getContacts: RequestHandler = async (req, res) => {

  let client: Client;
  let attachment: Attachment;
  let transaction: Transaction;

  try {
    const { host, port, db } = config;
    client = createNativeClient(getDefaultLibraryFilename());
    attachment = await client.connect(`${host}/${port}:${db}`);
    transaction = await attachment.startTransaction();

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
        name: 'contacts',
        query: `
          SELECT
            c.id,
            c.name,
            c.phone,
            p.name as folderName
          FROM
            gd_contact c JOIN gd_contact p ON p.id = c.parent
            ${req.params.taxId ? 'JOIN gd_companycode cc ON cc.companykey = c.id AND cc.taxid = ?' : ''}
          WHERE
            c.contacttype IN (2,3,5)`,
        params: req.params.taxId ? [req.params.taxId] : undefined
      },
    ];

    const result: IRequestResult = {
      queries: {
        ...Object.fromEntries(await Promise.all(queries.map( q => execQuery(q) )))
      },
      _params: req.params.taxId ? [{ taxId: req.params.taxId }] : undefined,
      _schema
    };

    return res.json(result);
  } finally {
    await transaction?.commit();
    await attachment?.disconnect();
    await client?.dispose();
  }
};