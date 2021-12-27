import { RequestHandler } from "express";
import { Client, Attachment, createNativeClient, getDefaultLibraryFilename, Transaction } from 'node-firebird-driver-native';

require('dotenv').config({ path: '../../../../.env' });

const config = {
  username: process.env.ISC_USER,
  password: process.env.ISC_PASSWORD,
  host: process.env.NODE_FB_TEST_HOST,
  port: process.env.NODE_FB_TEST_PORT,
  tmpDir: process.env.NODE_FB_TEST_TMP_DIR,
  db: process.env.NODE_FB_TEST_DB
};

export const getReconciliationStatement: RequestHandler = async (req, res) => {

  const dateBegin = new Date(2021, 0, 1);
  const dateEnd = new Date(2021, 2, 1);
  const customerId = 148_333_193;

  let client: Client;
  let attachment: Attachment;
  let transaction: Transaction;

  try {
    const { host, port, db } = config;
    client = createNativeClient(getDefaultLibraryFilename());
    attachment = await client.connect(`${host}/${port}:${db}`);
    transaction = await attachment.startTransaction();

    const getCustomerDebt = async () => {
      const query =
        `select
            e.usr$bg_dcontractjobkey,
            job.usr$number,
            sum(e.debitncu - e.creditncu) as saldo
        from
          ac_entry e
          left join gd_contact con on e.usr$gs_customer = con.id
          LEFT JOIN usr$bg_contractjob job ON job.id = e.usr$bg_dcontractjobkey
        where
          (e.accountkey = 148040931 or e.accountkey = 148040932 or e.accountkey = 148040933 or e.accountkey = 148040934 or
            e.accountkey = 148040935 or e.accountkey = 148040936 or e.accountkey = 148040939 or e.accountkey = 148040940
            or e.accountkey = 148040943 or e.accountkey = 148040944 or e.accountkey = 148040945  or e.accountkey = 165771266)
          and e.entrydate <= ? and e.usr$gs_customer = ?
        group by
          1, 2
        having
          sum(e.debitncu - e.creditncu) <> 0
        order by
          2 desc`;
      const rs = await attachment.executeQuery(transaction, query, [dateEnd, customerId]);
      try {
        return await rs.fetchAsObject<any[]>();
      } finally {
        await rs.close();
      }
    };

    const result = await Promise.all([getCustomerDebt()]);

    return res.json({ customerDebt: result[0] })
  } finally {
    await transaction?.commit();
    await attachment?.disconnect();
    await client?.dispose();
  }
};