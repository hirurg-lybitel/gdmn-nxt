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
        s.ID,
        USR$CONTRACTTYPE as CONTRACTTYPE,
        con.ID as CON_ID,
        con.NAME as CON_NAME
      FROM USR$CRM_SYSTEM_SETTINGS s
      LEFT JOIN GD_CONTACT con ON con.ID = s.USR$OURCOMPANY`;

    const settings = await fetchAsSingletonObject<ISystemSettings>(sql);

    if (settings['CON_ID']) {
      settings.OURCOMPANY = {
        ID: settings['CON_ID'],
        NAME: settings['CON_NAME']
      };
    }

    delete settings['CON_ID'];
    delete settings['CON_NAME'];

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
      CONTRACTTYPE = settings.CONTRACTTYPE,
      OURCOMPANY = settings.OURCOMPANY
    } = metadata;

    const result = await fetchAsSingletonObject<ISystemSettings>(`
      UPDATE OR INSERT INTO USR$CRM_SYSTEM_SETTINGS(ID, USR$CONTRACTTYPE, USR$OURCOMPANY)
      VALUES(:ID, :CONTRACTTYPE, :OURCOMPANY)
      MATCHING(ID)
      RETURNING ID`,
    {
      ID,
      CONTRACTTYPE,
      OURCOMPANY: OURCOMPANY?.ID ?? null
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
    CONTRACTTYPE,
    OURCOMPANY
  } = metadata;

  try {
    const result = await fetchAsSingletonObject<ISystemSettings>(
      `INSERT INTO USR$CRM_SYSTEM_SETTINGS(USR$CONTRACTTYPE, USR$OURCOMPANY)
      VALUES(:CONTRACTTYPE, :OURCOMPANY)
      RETURNING ID`,
      {
        CONTRACTTYPE,
        OURCOMPANY: OURCOMPANY?.ID ?? null
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
