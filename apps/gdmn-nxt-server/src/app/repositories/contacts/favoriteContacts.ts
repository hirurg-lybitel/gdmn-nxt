import { acquireReadTransaction, startTransaction } from '@gdmn-nxt/db-connection';
import { IFavoriteContact } from '@gsbelarus/util-api-types';

const find = async (
  sessionID: string,
  clause = {}
): Promise<IFavoriteContact[]> => {
  const { fetchAsObject, releaseReadTransaction } = await acquireReadTransaction(sessionID);

  try {
    const clauseString = Object
      .keys({ ...clause })
      .map(f => ` f.${f} = :${f}`)
      .join(' AND ');

    const sql = `
      SELECT
        f.USR$USER USER_ID,
        f.USR$CONTACT AS CONTACT_ID,
        con.NAME AS CONTACT_NAME
      FROM GD_CONTACT con
      JOIN USR$CRM_USER_FAVORITE_CONTACTS f ON con.ID = f.USR$CONTACT
      ${clauseString.length > 0 ? `WHERE ${clauseString}` : ''}`;

    const results = await fetchAsObject<IFavoriteContact>(sql, { ...clause });

    results?.forEach(f => {
      f.CONTACT = {
        ID: f['CONTACT_ID'],
        NAME: f['CONTACT_NAME']
      };
      f.USER = f['USER_ID'];
      delete f['USER_ID'];
      delete f['CONTACT_ID'];
      delete f['CONTACT_NAME'];
    });

    return results;
  } finally {
    releaseReadTransaction();
  }
};

const save = async (
  sessionID: string,
  userId: number,
  contactId: number
): Promise<IFavoriteContact> => {
  const { fetchAsSingletonObject, releaseTransaction } = await startTransaction(sessionID);

  try {
    const result = await fetchAsSingletonObject<IFavoriteContact>(
      `UPDATE OR INSERT INTO USR$CRM_USER_FAVORITE_CONTACTS(USR$USER, USR$CONTACT)
      VALUES(:USER_ID, :CONTACT_ID)
      MATCHING(USR$USER, USR$CONTACT)
      RETURNING ID, USR$USER, USR$CONTACT`,
      {
        USER_ID: userId,
        CONTACT_ID: contactId,
      }
    );

    await releaseTransaction();

    return result;
  } catch (error) {
    await releaseTransaction(false);
    throw new Error(error);
  }
};

const remove = async (
  sessionID: string,
  userId: number,
  contactId: number
): Promise<{ID: number}> => {
  const { fetchAsSingletonObject, releaseTransaction } = await startTransaction(sessionID);

  try {
    const deletedRecord = await fetchAsSingletonObject<{ID: number}>(
      `DELETE FROM USR$CRM_USER_FAVORITE_CONTACTS
      WHERE USR$USER = :USER_ID AND USR$CONTACT = :CONTACT_ID
      RETURNING ID`,
      {
        USER_ID: userId,
        CONTACT_ID: contactId
      }
    );

    await releaseTransaction();

    return deletedRecord;
  } catch (error) {
    await releaseTransaction(false);
    throw new Error(error);
  }
};

export const favoriteContactsRepository = {
  find,
  save,
  remove
};
