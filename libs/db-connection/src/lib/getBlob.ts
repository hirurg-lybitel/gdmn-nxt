import { string2Bin } from '@gsbelarus/util-helpers';
import { Attachment, Transaction } from 'node-firebird-driver-native';

export const getBlob = async (attachment: Attachment, transaction: Transaction, value: string) => {
  const charArrayString = value !== null ? string2Bin(value).toString() : null;
  const blobBuffer = Buffer.alloc(charArrayString !== null ? charArrayString?.length : 0, charArrayString);
  const blob = await attachment.createBlob(transaction);
  await blob.write(blobBuffer);
  await blob.close();

  return blob;
};
