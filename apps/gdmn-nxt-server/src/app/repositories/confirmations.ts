import { acquireReadTransaction, startTransaction } from '@gdmn-nxt/db-connection';
import { IConfirmation } from '@gsbelarus/util-api-types';

const create = async (
  sessionID: string,
  entity: Omit<IConfirmation, 'ID'>
): Promise<IConfirmation> => {
  const { fetchAsSingletonObject, releaseTransaction } = await startTransaction(sessionID);

  const { USER: USERKEY, EMAIL, CODE } = entity;
  try {
    const sql = `
      INSERT INTO USR$CRM_CONFIRMATIONS(USR$CODE, USR$EMAIL, USR$USERKEY)
      VALUES(:CODE, :EMAIL, :USERKEY)
      RETURNING ID, USR$CODE`;

    return await fetchAsSingletonObject(sql, { USERKEY, EMAIL, CODE })
      .then(r => {
        const { USR$CODE, ...rest } = r;
        return { ...rest, CODE: USR$CODE };
      });
  } finally {
    await releaseTransaction();
  }
};

const getByEmail = async (
  sessionID: string,
  email: string
): Promise<IConfirmation> => {
  const { fetchAsSingletonObject, releaseReadTransaction } = await acquireReadTransaction(sessionID);

  try {
    const sql = `
        SELECT ID, USR$CODE AS CODE, USR$ATTEMPTS ATTEMPTS
        FROM USR$CRM_CONFIRMATIONS
        WHERE USR$EMAIL = :EMAIL
        ORDER BY USR$CREATIONDATE DESC
        ROWS 1`;

    return await fetchAsSingletonObject(sql, { EMAIL: email });
  } finally {
    await releaseReadTransaction();
  }
};

const remove = async (
  sessionID: string,
  clause: object
) => {
  const { executeSingleton, releaseTransaction } = await startTransaction(sessionID);

  const key = Object.keys(clause)[0];
  const value = clause[key];

  const sql = `
      DELETE FROM USR$CRM_CONFIRMATIONS
      WHERE ${key} = :value`;

  await executeSingleton(sql, { value });
  await releaseTransaction();

  return true;
};

const updateAttempts = async (
  sessionID: string,
  id: number,
  attempts: number
) => {
  const { fetchAsSingletonObject, releaseTransaction } = await startTransaction(sessionID);

  const sql = `
    UPDATE USR$CRM_CONFIRMATIONS
    SET USR$ATTEMPTS = :ATTEMPTS
    WHERE ID = :ID
    RETURNING ID`;

  const result = await fetchAsSingletonObject(sql, { ID: id, ATTEMPTS: attempts });
  await releaseTransaction();
  return result.ID > 0;
};

export const confirmationsRepository = {
  create,
  getByEmail,
  remove,
  updateAttempts
};
