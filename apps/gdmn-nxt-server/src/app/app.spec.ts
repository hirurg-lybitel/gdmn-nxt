import { Client, createNativeClient, getDefaultLibraryFilename } from 'node-firebird-driver-native';
import * as fs from 'fs-extra-promise';
import * as tmp from 'temp-fs';

require('dotenv').config({ path: '../../../../.env' });

describe('Server', () => {

  const testConfig = {
    username: process.env.ISC_USER,
    password: process.env.ISC_PASSWORD,
    host: process.env.NODE_FB_TEST_HOST,
    port: process.env.NODE_FB_TEST_PORT,
    tmpDir: process.env.NODE_FB_TEST_TMP_DIR,
    db: process.env.NODE_FB_TEST_DB
  };

  const { host, port, db } = testConfig;

  function isLocal(): boolean {
    return testConfig.host == undefined ||
      testConfig.host == 'localhost' ||
      testConfig.host == '127.0.0.1';
  };

  function getTempFile(name: string): string {
    const database = `${testConfig.tmpDir}/${name}`;
    return (testConfig.host ?? '') +
      (testConfig.host && testConfig.port ? `/${testConfig.port}` : '') +
      (testConfig.host ? ':' : '') +
      database;
  };

  const holdingList = 148284864;
  const id = '148529707';

  jest.setTimeout(60000);

  let client: Client;

  beforeAll(() => {
    if (isLocal() && !testConfig.tmpDir) {
      testConfig.tmpDir = tmp.mkdirSync().path.toString();

      // Important for MacOS tests with non-embedded server.
      fs.chmodSync(testConfig.tmpDir, 0o777);
    }

    const defaultOptions = {
      password: testConfig.password,
      username: testConfig.username
    };

    client = createNativeClient(getDefaultLibraryFilename());

    client.defaultCreateDatabaseOptions = {
      forcedWrite: false,
      ...defaultOptions
    };

    client.defaultConnectOptions = {
      ...defaultOptions
    };
  });

  afterAll(async () => {
    await client.dispose();

    if (isLocal()) {
      fs.rmdirSync(testConfig.tmpDir!);
    }
  });

  test('connection', async () => {
    const attachment = await client.connect(`${host}/${port}:${db}`);
    await attachment.disconnect();
  });

  test('#executeReturningAsObject()', async () => {
    const attachment = await client.connect(`${host}/${port}:${db}`);
    const transaction = await attachment.startTransaction();
    const rs = await attachment.executeQuery(transaction,
      'SELECT FIRST 100 * FROM gd_contact');
    const ret = await rs.fetchAsObject<any[]>();
    expect(ret.length).toEqual(100);
    await rs.close();
    await transaction.commit();
    await attachment.disconnect();
  });

  test('debt customer', async () => {
    const attachment = await client.connect(`${host}/${port}:${db}`);
    const transaction = await attachment.startTransaction();
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
    const rs = await attachment.executeQuery(transaction, query, [new Date(), 148_333_193]);
    const ret = await rs.fetchAsObject<any[]>();
    expect(ret.length).toBeGreaterThan(0);
    await rs.close();
    await transaction.commit();
    await attachment.disconnect();
  });

  test('customer act', async () => {
    const attachment = await client.connect(`${host}/${port}:${db}`);
    const transaction = await attachment.startTransaction();
    const query =
      `select
        doc.DOCUMENTDATE,
        cust.name as customer,
        act.USR$SUMACT as sumact,
        act.USR$DESCRIPTION,
        empl.name as emplname
      from
        gd_document doc
        left join USR$BG_CUSTBUH act on act.DOCUMENTKEY = doc.id
        left join gd_contact cust on cust.ID = act.USR$CUSTOMERKEY
        left join gd_contact empl on empl.ID = act.USR$EMPLKEY
      where
        doc.DOCUMENTTYPEKEY = 347370489
        and cust.ID = ?
      Order by 1
      `;
    const rs = await attachment.executeQuery(transaction, query, [148_333_193]);
    const ret = await rs.fetchAsObject<any[]>();
    expect(ret.length).toBeGreaterThan(0);
    await rs.close();
    await transaction.commit();
    await attachment.disconnect();
  });

  test('contact', async () => {
    const attachment = await client.connect(`${host}/${port}:${db}`);
    const transaction = await attachment.startTransaction();
    const query = `select * from gd_contact where id = ?`;
    const rs = await attachment.executeQuery(transaction, query, [148_333_193]);
    const ret = await rs.fetchAsObject<any[]>();
    expect(ret.length).toBeGreaterThan(0);
    await rs.close();
    await transaction.commit();
    await attachment.disconnect();
  });

  test('saldo', async () => {
    const attachment = await client.connect(`${host}/${port}:${db}`);
    const transaction = await attachment.startTransaction();
    const query = `
      SELECT SUM(e.debitncu - e.creditncu) as Saldo
      FROM ac_entry e JOIN ac_account a ON e.accountkey = a.id
          and e.entrydate < ? and e.usr$GS_CUSTOMER = ?
      JOIN ac_account a1 ON a.LB >= a1.LB and a.RB <= a1.RB and a1.id in (${id})
      JOIN ac_record r ON e.recordkey = r.id and r.companykey + 0 IN (${holdingList})
    `;
    const rs = await attachment.executeQuery(transaction, query, [new Date(), 148_333_193]);
    const ret = await rs.fetchAsObject<any[]>();
    expect(ret.length).toBeGreaterThan(0);
    await rs.close();
    await transaction.commit();
    await attachment.disconnect();
  });

  test('movement', async () => {
    const attachment = await client.connect(`${host}/${port}:${db}`);
    const transaction = await attachment.startTransaction();
    const query = `
 SELECT  entry.usr$bg_dcontractjobkey as job, a.alias, doct.name, doc.number, doc.documentdate, r.description, job.usr$number as jobnumber,  SUM(entry.creditncu) as GiveSum,
   CAST(0 as numeric(15,2)) as GiveSum2
 FROM ac_entry entry JOIN ac_account a ON entry.accountkey = a.id
    and entry.entrydate >= ? and entry.entrydate <= ? and entry.usr$GS_CUSTOMER = ?
    JOIN ac_account a1 ON a.LB >= a1.LB and a.RB <= a1.RB and a1.id in (${id})
    JOIN ac_record r ON entry.recordkey = r.id  AND r.companykey + 0 IN (${holdingList})
    LEFT JOIN gd_document doc ON r.documentkey = doc.id
    LEFT JOIN usr$bg_contractjob job ON job.id = entry.usr$bg_dcontractjobkey
    LEFT JOIN gd_documenttype doct ON doc.documenttypekey = doct.id
 WHERE
    NOT EXISTS(
      SELECT e_m.id FROM
    ac_entry e_m
    JOIN ac_record r_m ON e_m.recordkey=r_m.id
    JOIN ac_entry e_cm ON e_cm.recordkey=r_m.id AND
      e_cm.accountpart <> e_m.accountpart AND
      e_cm.accountkey=e_m.accountkey AND
      (e_m.debitncu=e_cm.creditncu OR
      e_m.creditncu=e_cm.debitncu OR
      e_m.debitcurr=e_cm.creditcurr OR
      e_m.creditcurr=e_cm.debitcurr)AND
      e_m.USR$GS_CUSTOMER=e_cm.USR$GS_CUSTOMER
    WHERE e_m.id = entry.id )
 GROUP BY entry.usr$bg_dcontractjobkey, r.description, a.alias, doct.name, doc.number, doc.documentdate, job.usr$number
 HAVING SUM(entry.creditncu) <> 0

    union

 SELECT  entry.usr$bg_dcontractjobkey as job, a.alias, doct.name, doc.number, doc.documentdate, r.description, job.usr$number as jobnumber, CAST(0 as numeric(15,2)) as GiveSum, SUM(entry.debitncu) as GiveSum2
 FROM ac_entry entry JOIN ac_account a ON entry.accountkey = a.id
    and entry.entrydate >= ? and entry.entrydate <= ? and entry.usr$GS_CUSTOMER = ?
    JOIN ac_account a1 ON a.LB >= a1.LB and a.RB <= a1.RB and a1.id in (${id})
    JOIN ac_record r ON entry.recordkey = r.id  AND r.companykey + 0 IN (${holdingList})
    LEFT JOIN gd_document doc ON entry.usr$GS_document = doc.id
    LEFT JOIN usr$bg_contractjob job ON job.id = entry.usr$bg_dcontractjobkey
    LEFT JOIN gd_documenttype doct ON doc.documenttypekey = doct.id
 WHERE
    NOT EXISTS(
      SELECT e_m.id FROM
    ac_entry e_m
    JOIN ac_record r_m ON e_m.recordkey=r_m.id
    JOIN ac_entry e_cm ON e_cm.recordkey=r_m.id AND
      e_cm.accountpart <> e_m.accountpart AND
      e_cm.accountkey=e_m.accountkey AND
      (e_m.debitncu=e_cm.creditncu OR
      e_m.creditncu=e_cm.debitncu OR
      e_m.debitcurr=e_cm.creditcurr OR
      e_m.creditcurr=e_cm.debitcurr)AND
      e_m.USR$GS_CUSTOMER=e_cm.USR$GS_CUSTOMER
    WHERE e_m.id = entry.id )
 GROUP BY entry.usr$bg_dcontractjobkey, r.description, a.alias, doct.name, doc.number, doc.documentdate, job.usr$number
 HAVING SUM(entry.debitncu) <> 0
  ORDER BY  1, 5, 3, 4
    `;
    const rs = await attachment.executeQuery(transaction, query, [new Date(), new Date(), 148_333_193, new Date(), new Date(), 148_333_193]);
    const ret = await rs.fetchAsObject<any[]>();
    await rs.close();
    await transaction.commit();
    await attachment.disconnect();
  });

  test('payment', async () => {
    const attachment = await client.connect(`${host}/${port}:${db}`);
    const transaction = await attachment.startTransaction();
    const query = `
 SELECT r.description, doct.name, doc.number, doc.documentdate, SUM(entry.debitncu) as GiveSum
 FROM ac_entry entry JOIN ac_account a ON entry.accountkey = a.id
    and entry.entrydate >= ? and entry.entrydate <= ? and entry.usr$GS_CUSTOMER = ?
    JOIN ac_account a1 ON a.LB >= a1.LB and a.RB <= a1.RB and a1.id in (${id})
    JOIN ac_record r ON entry.recordkey = r.id  AND r.companykey + 0 IN (${holdingList})
    LEFT JOIN gd_document doc ON r.documentkey = doc.id
    LEFT JOIN gd_documenttype doct ON doc.documenttypekey = doct.id
 WHERE
    NOT EXISTS(
      SELECT e_m.id FROM
    ac_entry e_m
    JOIN ac_record r_m ON e_m.recordkey=r_m.id
    JOIN ac_entry e_cm ON e_cm.recordkey=r_m.id AND
      e_cm.accountpart <> e_m.accountpart AND
      e_cm.accountkey=e_m.accountkey AND
      (e_m.debitncu=e_cm.creditncu OR
      e_m.creditncu=e_cm.debitncu OR
      e_m.debitcurr=e_cm.creditcurr OR
      e_m.creditcurr=e_cm.debitcurr)AND
      e_m.USR$GS_CUSTOMER=e_cm.USR$GS_CUSTOMER
    WHERE e_m.id = entry.id )
 GROUP BY r.description, doct.name, doc.number, doc.documentdate
 HAVING SUM(entry.debitncu) <> 0
 ORDER BY doc.documentdate, doct.name, doc.number
 `;
    const rs = await attachment.executeQuery(transaction, query, [new Date(), new Date(), 148_333_193]);
    const ret = await rs.fetchAsObject<any[]>();
    await rs.close();
    await transaction.commit();
    await attachment.disconnect();
  });

  test('firm', async () => {
    const attachment = await client.connect(`${host}/${port}:${db}`);
    const transaction = await attachment.startTransaction();
    const query = `
SELECT con.*, com.*, chief.Name as Chief, acc.Name as Account FROM gd_contact con JOIN gd_company com ON com.contactkey = con.id
 LEFT JOIN gd_contact chief ON com.DIRECTORKEY = chief.id
 LEFT JOIN gd_contact acc ON com.CHIEFACCOUNTANTKEY = acc.id
 WHERE con.id = ?
 `;
    const rs = await attachment.executeQuery(transaction, query, [id]);
    const ret = await rs.fetchAsObject<any[]>();
    await rs.close();
    await transaction.commit();
    await attachment.disconnect();
  });

});