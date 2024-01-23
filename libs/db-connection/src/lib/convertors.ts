import { string2Bin } from '@gsbelarus/util-helpers';
import { Attachment, Blob, Transaction } from 'node-firebird-driver-native';

export const getBlob = async (attachment: Attachment, transaction: Transaction, value: string) => {
  const charArrayString = value !== null ? string2Bin(value).toString() : null;
  const blobBuffer = Buffer.alloc(charArrayString !== null ? charArrayString?.length : 0, charArrayString);
  const blob = await attachment.createBlob(transaction);
  await blob.write(blobBuffer);
  await blob.close();

  return blob;
};

export const getStringFromBlob = async (attachment: Attachment, transaction: Transaction, value: Blob) => {
  const readStream = await attachment.openBlob(transaction, value);
  const blobLength = await readStream?.length;

  if (blobLength === 0) return '';
  const resultBuffer = Buffer.alloc(blobLength);

  let size = 0;
  let n: number;
  while (size < blobLength && (n = await readStream.read(resultBuffer.subarray(size))) > 0) size += n;

  await readStream.close();

  const blob2String = resultBuffer.toString();
  const array = blob2String.split(',')?.map(b => +b);
  let result = '';
  for (let i = 0; i < array.length; i++) {
    result += String.fromCharCode(array[i]);
  }

  return result;
};
