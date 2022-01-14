import { Client, Attachment, createNativeClient, getDefaultLibraryFilename, Transaction } from 'node-firebird-driver-native';
import { config } from "./db-config";

const { host, port, db } = config;

export const setConnection = async () => {
  const client = createNativeClient(getDefaultLibraryFilename());
  const attachment = await client.connect(`${host}/${port}:${db}`);
  const transaction = await attachment.startTransaction();
  return { client, attachment, transaction };
};

export const closeConnection = async (client: Client, attachment: Attachment, transaction: Transaction) => {
  await transaction.commit();
  await attachment.disconnect();
  await client.dispose();
};
