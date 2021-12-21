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

  jest.setTimeout(30000);

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
});