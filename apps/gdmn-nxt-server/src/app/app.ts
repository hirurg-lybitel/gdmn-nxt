import { IAccount, IAuthResult, IWithID } from "@gsbelarus/util-api-types";
import { Client, Attachment, createNativeClient, getDefaultLibraryFilename, Transaction } from 'node-firebird-driver-native';
import { config } from "./db-config";
import { closeConnection, setConnection } from "./db-connection";

export const checkGedeminUser = async (userName: string, password: string): Promise<IAuthResult> => {
  const query = `
    SELECT
      u.passw,
      u.ingroup,
      u.disabled as userDisabled,
      c.name as contactName,
      c.disabled as contactDisabled,
      p.firstname,
      p.surname
    FROM
      gd_user u
      JOIN gd_contact c ON c.id = u.contactkey
      JOIN gd_people p ON p.contactkey = c.id
    WHERE UPPER(u.name) = ?
  `;

  let client: Client;
  let attachment: Attachment;
  let transaction: Transaction;

  try {
    const { host, port, db } = config;
    client = createNativeClient(getDefaultLibraryFilename());
    attachment = await client.connect(`${host}/${port}:${db}`);
    transaction = await attachment.startTransaction();
    const rs = await attachment.executeQuery(transaction, query, [userName.toLocaleUpperCase()]);
    try {
      const data = await rs.fetchAsObject();

      if (data.length === 1) {
        if (data[0]['PASSW'] !== password) {
          return {
            result: 'INVALID_PASSWORD'
          };
        }

        if (data[0]['USERDISABLED'] || data[0]['CONTACTDISABLED']) {
          return {
            result: 'ACCESS_DENIED'
          };
        }

        return {
          result: 'SUCCESS',
          userProfile: {
            userName,
            firstname: data[0]['FIRSTNAME'],
            surname: data[0]['SURNAME']
          }
        };
      } else if (!data.length) {
        return {
          result: 'UNKNOWN_USER'
        };
      } else {
        throw new Error('Data corrupted.')
      }
    } finally {
      await rs.close();
    }
  } finally {
    await transaction?.commit();
    await attachment?.disconnect();
    await client?.dispose();
  }
};

export const getGedeminUser = async (userName: string): Promise<{ userName: string } | undefined> => {
  const query = `
    SELECT
      u.name
    FROM
      gd_user u
    WHERE UPPER(u.name) = ?
  `;

  let client: Client;
  let attachment: Attachment;
  let transaction: Transaction;

  try {
    const { host, port, db } = config;
    client = createNativeClient(getDefaultLibraryFilename());
    attachment = await client.connect(`${host}/${port}:${db}`);
    transaction = await attachment.startTransaction();
    const rs = await attachment.executeQuery(transaction, query, [userName.toLocaleUpperCase()]);
    try {
      const data = await rs.fetchAsObject();

      if (data.length === 1) {
        return {
          userName
        }
      } else if (!data.length) {
        return undefined;
      } else {
        throw new Error('Data corrupted.')
      }
    } finally {
      await rs.close();
    }
  } finally {
    await transaction?.commit();
    await attachment?.disconnect();
    await client?.dispose();
  }
};

export const getAccount = async (email: string): Promise<(IAccount & IWithID) | undefined> => {
  console.log('getAccount...');

  const query = `
    SELECT
      acc.*
    FROM
      usr$crm_account acc
    WHERE UPPER(acc.usr$email) = ?
  `;
  const { attachment, transaction} = await setConnection();

  try {
    const rs = await attachment.executeQuery(transaction, query, [email.toLocaleUpperCase()]);
    try {
      const data = await rs.fetchAsObject<IAccount & IWithID>();

      if (data.length === 1) {
        return data[0];
      } else if (!data.length) {
        return undefined;
      } else {
        throw new Error('More than one account with the same email.')
      }
    } finally {
      await rs.close();
    }
  } finally {
    await closeConnection(attachment, transaction);
  }
};
