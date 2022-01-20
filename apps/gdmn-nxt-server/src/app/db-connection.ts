import { Client, Attachment, createNativeClient, getDefaultLibraryFilename, Transaction, TransactionIsolation } from 'node-firebird-driver-native';
import { config } from "./db-config";

const { host, port, db, username, password } = config;

export const setConnection = async () => {
  const client = createNativeClient(getDefaultLibraryFilename());
  const attachment = await client.connect(`${host}/${port}:${db}`, { username, password });
  const transaction = await attachment.startTransaction({ isolation: TransactionIsolation.READ_COMMITTED, readCommittedMode: 'RECORD_VERSION', waitMode: 'NO_WAIT' });
  return { client, attachment, transaction };
};

export const closeConnection = async (client: Client, attachment: Attachment, transaction: Transaction) => {
  if ((transaction as any).attachment) {
    await transaction.commit();
  }
  await attachment.disconnect();
  await client.dispose();
};
