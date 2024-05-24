import { IWithID } from '@gsbelarus/util-api-types';
import { Attachment, Transaction } from 'node-firebird-driver-native';

export const getIdBySystemRUID = async (
  attachment: Attachment,
  transaction: Transaction,
  params: {
    XID: number,
    DBID: number
  }
): Promise<number> => {
  const { XID, DBID } = params;

  const rs = await attachment.executeQuery(transaction, 'SELECT ID FROM GD_RUID WHERE XID = ? AND DBID = ?', [XID, DBID]);
  try {
    return (await rs.fetchAsObject<IWithID>())[0].ID;
  } catch {
    return -1;
  } finally {
    await rs.close();
  }
};
