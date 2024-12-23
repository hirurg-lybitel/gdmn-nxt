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
        con.NAME as CON_NAME,
        s.USR$SMTP_HOST SMTP_HOST,
        s.USR$SMTP_USER SMTP_USER,
        s.USR$SMTP_PASSWORD SMTP_PASSWORD,
        s.USR$SMTP_PORT SMTP_PORT
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

    settings.smtpHost = settings['SMTP_HOST'];
    settings.smtpUser = settings['SMTP_USER'];
    settings.smtpPassword = settings['SMTP_PASSWORD'];
    settings.smtpPort = settings['SMTP_PORT'];

    delete settings['SMTP_HOST'];
    delete settings['SMTP_USER'];
    delete settings['SMTP_PASSWORD'];
    delete settings['SMTP_PORT'];

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
      OURCOMPANY = settings.OURCOMPANY,
      smtpHost = settings.smtpHost,
      smtpUser = settings.smtpUser,
      smtpPassword = settings.smtpPassword,
      smtpPort = settings.smtpPort,
    } = metadata;

    const result = await fetchAsSingletonObject<ISystemSettings>(`
      UPDATE OR INSERT INTO USR$CRM_SYSTEM_SETTINGS(ID, USR$CONTRACTTYPE, USR$OURCOMPANY,
        USR$SMTP_HOST, USR$SMTP_USER, USR$SMTP_PASSWORD, USR$SMTP_PORT)
      VALUES(:ID, :CONTRACTTYPE, :OURCOMPANY, :SMTP_HOST, :SMTP_USER, :SMTP_PASSWORD, :SMTP_PORT)
      MATCHING(ID)
      RETURNING ID`,
    {
      ID,
      CONTRACTTYPE,
      OURCOMPANY: OURCOMPANY?.ID ?? null,
      SMTP_HOST: smtpHost,
      SMTP_USER: smtpUser,
      SMTP_PASSWORD: smtpPassword,
      SMTP_PORT: smtpPort
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
    OURCOMPANY,
    smtpHost,
    smtpUser,
    smtpPassword,
    smtpPort,
  } = metadata;

  try {
    const result = await fetchAsSingletonObject<ISystemSettings>(
      `INSERT INTO USR$CRM_SYSTEM_SETTINGS(USR$CONTRACTTYPE, USR$OURCOMPANY,
        USR$SMTP_HOST, USR$SMTP_USER, USR$SMTP_PASSWORD, USR$SMTP_PORT)
      VALUES(:CONTRACTTYPE, :OURCOMPANY, :SMTP_HOST, :SMTP_USER, :SMTP_PASSWORD, :SMTP_PORT)
      RETURNING ID`,
      {
        CONTRACTTYPE,
        OURCOMPANY: OURCOMPANY?.ID ?? null,
        SMTP_HOST: smtpHost,
        SMTP_USER: smtpUser,
        SMTP_PASSWORD: smtpPassword,
        SMTP_PORT: smtpPort
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
