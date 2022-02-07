import { Client, Attachment, createNativeClient, getDefaultLibraryFilename, Transaction, TransactionIsolation } from 'node-firebird-driver-native';
import { config } from "./db-config";

const { host, port, db, username, password } = config;

let client: Client;

export const setConnection = async () => {
  if (!client?.isValid) {
    client = createNativeClient(getDefaultLibraryFilename());
  }
  const attachment = await client.connect(`${host}/${port}:${db}`, { username, password });
  const transaction = await attachment.startTransaction({ isolation: TransactionIsolation.READ_COMMITTED, readCommittedMode: 'RECORD_VERSION', waitMode: 'NO_WAIT' });
  return { attachment, transaction };
};

export const closeConnection = async (attachment: Attachment, transaction: Transaction) => {
  if (transaction.isValid) {
    await transaction.commit();
  }
  await attachment.disconnect();
};

export const disposeConnection = async () => {
  if (client?.isValid) {
    await client.dispose();
  }
}; 
