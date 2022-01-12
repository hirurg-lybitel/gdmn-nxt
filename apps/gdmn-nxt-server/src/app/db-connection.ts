import { Client, Attachment, createNativeClient, getDefaultLibraryFilename, Transaction } from 'node-firebird-driver-native';
import { config } from "./db-config";


let client: Client = null;
let attachment: Attachment = null;
let transaction: Transaction = null;

const { host, port, db } = config;

export const setConnection = async () => {
  client = createNativeClient(getDefaultLibraryFilename());
  attachment = await client.connect(`${host}/${port}:${db}`);
  transaction = await attachment.startTransaction();
}

export const closeConnection = async () => {
  await transaction?.commit();
  await attachment?.disconnect();
  await client?.dispose();
}

export { client, attachment, transaction };
