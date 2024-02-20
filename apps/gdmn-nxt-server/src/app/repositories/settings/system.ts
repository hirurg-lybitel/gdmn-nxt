import { acquireReadTransaction, startTransaction } from '@gdmn-nxt/db-connection';
import { FindOneHandler, ISystemSettings, SaveHandler, UpdateHandler } from '@gsbelarus/util-api-types';

const findOne: FindOneHandler<ISystemSettings> = async (
  sessionID,
  clause = {},
) => {
  const { releaseReadTransaction, fetchAsSingletonObject } = await acquireReadTransaction(sessionID);
  try {
    const sql = `
      SELECT
        ID,
        USR$CONTRACTTYPE as CONTRACTTYPE
      FROM USR$CRM_SYSTEM_SETTINGS`;

    const settings = await fetchAsSingletonObject<ISystemSettings>(sql);

    return settings;
  } finally {
    await releaseReadTransaction();
  }
};

const update: UpdateHandler<ISystemSettings> = async (
  sessionID,
  id,
  metadata
) => {
  const { fetchAsSingletonObject, releaseTransaction, generateId } = await startTransaction(sessionID);

  try {
    const settings = await findOne(sessionID, { id });

    const ID = await (() => {
      if (!settings) {
        return generateId();
      }
      return settings.ID;
    })();

    const {
      CONTRACTTYPE = settings.CONTRACTTYPE
    } = metadata;

    const result = await fetchAsSingletonObject<ISystemSettings>(`
      UPDATE OR INSERT INTO USR$CRM_SYSTEM_SETTINGS(ID, USR$CONTRACTTYPE)
      VALUES(:ID, :CONTRACTTYPE)
      MATCHING(ID)
      RETURNING ID`,
    {
      ID,
      CONTRACTTYPE,
    }
    );

    await releaseTransaction();

    return result;
  } catch (error) {
    await releaseTransaction(false);
    throw new Error(error);
  }
};

const save: SaveHandler<ISystemSettings> = async (
  sessionID,
  metadata
) => {
  const { fetchAsSingletonObject, releaseTransaction } = await startTransaction(sessionID);

  const {
    CONTRACTTYPE
  } = metadata;

  try {
    const result = await fetchAsSingletonObject<ISystemSettings>(
      `INSERT INTO USR$CRM_SYSTEM_SETTINGS(USR$CONTRACTTYPE)
      VALUES(:CONTRACTTYPE)
      RETURNING ID`,
      {
        CONTRACTTYPE
      }
    );

    await releaseTransaction();

    return result;
  } catch (error) {
    await releaseTransaction(false);
    throw new Error(error);
  }
};

export const systemSettingsRepository = {
  findOne,
  update,
  save
};
