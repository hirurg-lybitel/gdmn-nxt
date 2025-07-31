import { IProfileSettings, IRequestResult, UserType } from '@gsbelarus/util-api-types';
import { parseIntDef } from '@gsbelarus/util-useful';
import { Request, RequestHandler } from 'express';
import { resultError } from '../../responseMessages';
import { acquireReadTransaction, getReadTransaction, startTransaction, releaseReadTransaction as releaseRT } from '@gdmn-nxt/db-connection';
import { bin2String, string2Bin } from '@gsbelarus/util-helpers';
import { closeUserSession } from '../../utils/sessions-helper';
import { setPermissonsCache } from '../../middlewares/permissions';

type GetSettingsParams = {
  sessionId: string;
  type?: UserType;
} & ({
  userId: number;
  contactId?: number;
} | {
  userId?: number;
  contactId: number;
});

const getSettings = async ({
  sessionId,
  userId: _userId,
  contactId,
  type
}: GetSettingsParams) => {
  const { releaseReadTransaction, fetchAsObject, fetchAsSingletonObject } = await acquireReadTransaction(sessionId);
  const { attachment, transaction } = await getReadTransaction(sessionId);

  const ticketsUser = type === UserType.Tickets;

  try {
    const userId: number = await (async () => {
      if (_userId) return _userId;

      const userInfo = await fetchAsSingletonObject(`
        SELECT ID
        FROM GD_USER
        WHERE CONTACTKEY = :contactId`, { contactId });

      return userInfo?.ID ?? -1;
    })();

    const required2fa = await (async () => {
      if (ticketsUser) return false;

      const check2FA = await fetchAsSingletonObject(`
      SELECT ug.USR$REQUIRED_2FA GROUP_2FA, ul.USR$REQUIRED_2FA USER_2FA
      FROM USR$CRM_PERMISSIONS_USERGROUPS ug
      JOIN USR$CRM_PERMISSIONS_UG_LINES ul ON ul.USR$GROUPKEY = ug.ID
      WHERE ul.USR$USERKEY = :userId`, { userId });

      return !!check2FA?.USER_2FA || !!check2FA?.GROUP_2FA;
    })();

    const sqlResult = await (async () => {
      if (ticketsUser) {
        const result = await fetchAsObject(
          `SELECT
            ps.USR$AVATAR as AVATAR_BLOB,
            ps.USR$MODE as ColorMode,
            ps.USR$LASTVERSION as LASTVERSION,
            ps.USR$SEND_EMAIL_NOTIFICATION as SEND_EMAIL_NOTIFICATIONS,
            u.USR$EMAIL as EMAIL,
            ps.USR$PUSH_NOTIFICATIONS as PUSH_NOTIFICATIONS_ENABLED,
            ps.USR$SAVEFILTERS as SAVEFILTERS,
            u.USR$ONE_TIME_PASSWORD,
            u.USR$FULLNAME as FULLNAME,
            u.USR$PHONE as PHONE
          FROM USR$CRM_USER u
            LEFT JOIN USR$CRM_T_USER_PROFILE_SETTINGS ps ON ps.USR$USERKEY = u.ID
          WHERE u.ID = :userId`,
          { userId }
        );

        for (const r of result) {
          if (r['AVATAR_BLOB'] !== null && typeof r['AVATAR_BLOB'] === 'object') {
            // eslint-disable-next-line dot-notation
            const readStream = await attachment.openBlob(transaction, r['AVATAR_BLOB']);
            const blobLength = await readStream?.length;
            const resultBuffer = Buffer.alloc(blobLength);

            let size = 0;
            let n: number;
            while (size < blobLength && (n = await readStream.read(resultBuffer.subarray(size))) > 0) size += n;

            await readStream.close();

            const blob2String = resultBuffer.toString();
            // eslint-disable-next-line dot-notation
            r['AVATAR'] = bin2String(blob2String.split(','));
          };
          r['SEND_EMAIL_NOTIFICATIONS'] = (r['SEND_EMAIL_NOTIFICATIONS'] ?? 0) === 1;
          r['PUSH_NOTIFICATIONS_ENABLED'] = (r['PUSH_NOTIFICATIONS_ENABLED'] ?? 0) === 1;
          r['ENABLED_2FA'] = false;
          r['REQUIRED_2FA'] = false;
          r['SAVEFILTERS'] = r['SAVEFILTERS'] === 1;
          r['ONE_TIME_PASSWORD'] = r['USR$ONE_TIME_PASSWORD'] === 1;
          delete r['USR$ONE_TIME_PASSWORD'];
          delete r['AVATAR_BLOB'];
        };

        return result;
      }

      const result = await fetchAsObject(
        `SELECT
          w.NAME as RANK, ps.USR$AVATAR as AVATAR_BLOB, ps.USR$MODE as ColorMode, ps.USR$LASTVERSION as LASTVERSION,
          ps.USR$SEND_EMAIL_NOTIFICATIONS as SEND_EMAIL_NOTIFICATIONS, c.EMAIL, c.NAME as FULLNAME,
          ps.USR$2FA_ENABLED AS ENABLED_2FA, ps.USR$SECRETKEY AS SECRETKEY,
          ps.USR$PUSH_NOTIFICATIONS_ENABLED as PUSH_NOTIFICATIONS_ENABLED,
          ps.USR$LAST_IP as LAST_IP,
          ps.USR$SAVEFILTERS as SAVEFILTERS,
          c.PHONE
        FROM GD_USER u
          JOIN GD_PEOPLE p ON p.CONTACTKEY = u.CONTACTKEY
          JOIN GD_CONTACT c ON c.ID = u.CONTACTKEY
          LEFT JOIN USR$CRM_PROFILE_SETTINGS ps ON ps.USR$USERKEY = u.ID
          LEFT JOIN WG_POSITION w ON w.ID = p.WPOSITIONKEY
        WHERE u.ID = :userId`,
        { userId }
      );

      for (const r of result) {
        if (r['AVATAR_BLOB'] !== null && typeof r['AVATAR_BLOB'] === 'object') {
          // eslint-disable-next-line dot-notation
          const readStream = await attachment.openBlob(transaction, r['AVATAR_BLOB']);
          const blobLength = await readStream?.length;
          const resultBuffer = Buffer.alloc(blobLength);

          let size = 0;
          let n: number;
          while (size < blobLength && (n = await readStream.read(resultBuffer.subarray(size))) > 0) size += n;

          await readStream.close();

          const blob2String = resultBuffer.toString();
          // eslint-disable-next-line dot-notation
          r['AVATAR'] = bin2String(blob2String.split(','));
        };
        r['SEND_EMAIL_NOTIFICATIONS'] = (r['SEND_EMAIL_NOTIFICATIONS'] ?? 0) === 1;
        r['PUSH_NOTIFICATIONS_ENABLED'] = (r['PUSH_NOTIFICATIONS_ENABLED'] ?? 0) === 1;
        r['ENABLED_2FA'] = r['ENABLED_2FA'] === 1;
        r['REQUIRED_2FA'] = required2fa;
        r['SAVEFILTERS'] = r['SAVEFILTERS'] === 1;
        r['ONE_TIME_PASSWORD'] = false;
        delete r['AVATAR_BLOB'];
      };

      return result;
    })();

    const result = sqlResult[0] as IProfileSettings;

    return {
      OK: true,
      settings: {
        ...result
      }
    };
  } catch (error) {
    console.error(error);
    return {
      OK: false,
      error
    };
  } finally {
    /** Так как используем две транзакции */
    await releaseRT(sessionId);
    await releaseReadTransaction();
  }
};

const get: RequestHandler = async (req, res) => {
  const userId = parseIntDef(req.params.userId, -1);
  const data = await getSettings({ userId, sessionId: req.sessionID, type: req.user['type'] });

  if (!data.OK) return res.status(500).send(resultError(data.error));

  const result: IRequestResult<{ settings: IProfileSettings; }> = {
    queries: { settings: data.settings },
    _params: [{ userId }],
    _schema: {}
  };

  return res.status(200).json(result);
};

const set: RequestHandler = async (req, res) => {
  const { attachment, transaction, releaseTransaction, fetchAsObject, fetchAsSingletonObject } = await startTransaction(req.sessionID);

  const userId = parseIntDef(req.params.userId, -1);
  const ticketsUser = req.user['type'] === UserType.Tickets;

  const {
    AVATAR: avatar,
    COLORMODE: colorMode,
    LASTVERSION: lastVersion,
    SEND_EMAIL_NOTIFICATIONS,
    PUSH_NOTIFICATIONS_ENABLED,
    EMAIL,
    SAVEFILTERS,
    FULLNAME,
    PHONE
  } = req.body;


  try {
    const charArrayString = avatar !== null ? string2Bin(avatar).toString() : null;
    const blobBuffer = Buffer.alloc(charArrayString !== null ? charArrayString?.length : 0, charArrayString);
    const blob = await attachment.createBlob(transaction);
    await blob.write(blobBuffer);
    await blob.close();

    if (ticketsUser) {
      const updateEmail = await fetchAsObject(
        `UPDATE USR$CRM_USER c
          SET
          USR$EMAIL = :EMAIL,
          USR$FULLNAME = :FULLNAME,
          USR$PHONE = :PHONE
        WHERE c.ID = :userId
        RETURNING USR$EMAIL`,
        { userId, EMAIL, FULLNAME, PHONE }
      );
    } else {
      const updateEmail = await fetchAsObject(
        `UPDATE GD_CONTACT c
      SET EMAIL = :EMAIL
      WHERE EXISTS(SELECT ID FROM GD_USER u WHERE u.CONTACTKEY = c.ID AND u.ID = :userId)
      RETURNING EMAIL`,
        { userId, EMAIL }
      );
    }

    const sqlResult = await (async () => {
      if (ticketsUser) {
        return await fetchAsSingletonObject(
          `UPDATE OR INSERT INTO USR$CRM_T_USER_PROFILE_SETTINGS(USR$USERKEY, USR$AVATAR, USR$MODE, USR$LASTVERSION, USR$SEND_EMAIL_NOTIFICATION, USR$PUSH_NOTIFICATIONS, USR$SAVEFILTERS)
          VALUES(:userId, :avatar, :colorMode, :lastVersion, :SEND_EMAIL_NOTIFICATIONS, :PUSH_NOTIFICATIONS_ENABLED, :SAVEFILTERS)
          MATCHING(USR$USERKEY)
          RETURNING ID`,
          {
            userId,
            avatar: blob,
            colorMode,
            lastVersion,
            SEND_EMAIL_NOTIFICATIONS: Number(SEND_EMAIL_NOTIFICATIONS),
            PUSH_NOTIFICATIONS_ENABLED: Number(PUSH_NOTIFICATIONS_ENABLED),
            SAVEFILTERS: (SAVEFILTERS ? 1 : 0)
          });
      }
      return await fetchAsSingletonObject(
        `UPDATE OR INSERT INTO USR$CRM_PROFILE_SETTINGS(USR$USERKEY, USR$AVATAR, USR$MODE, USR$LASTVERSION, USR$SEND_EMAIL_NOTIFICATIONS, USR$PUSH_NOTIFICATIONS_ENABLED, USR$SAVEFILTERS)
      VALUES(:userId, :avatar, :colorMode, :lastVersion, :SEND_EMAIL_NOTIFICATIONS, :PUSH_NOTIFICATIONS_ENABLED, :SAVEFILTERS)
      MATCHING(USR$USERKEY)
      RETURNING ID`,
        {
          userId,
          avatar: blob,
          colorMode,
          lastVersion,
          SEND_EMAIL_NOTIFICATIONS: Number(SEND_EMAIL_NOTIFICATIONS),
          PUSH_NOTIFICATIONS_ENABLED: Number(PUSH_NOTIFICATIONS_ENABLED),
          SAVEFILTERS: (SAVEFILTERS ? 1 : 0)
        });
    })();

    const result: IRequestResult = {
      queries: { settings: [sqlResult] },
      _schema: {}
    };

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).send(resultError(error.message));
  } finally {
    await releaseTransaction(res.statusCode === 200);
  }
};


const upsertSecretKey = async (req: Request, body: { userId: number, secretKey?: string, email?: string, enabled2fa?: boolean; }) => {
  const { releaseTransaction, executeSingletonAsObject } = await startTransaction(req.sessionID);

  try {
    const { secretKey, userId, email, enabled2fa } = body;

    await executeSingletonAsObject(
      `UPDATE OR INSERT INTO USR$CRM_PROFILE_SETTINGS(USR$USERKEY
        ${typeof secretKey !== 'undefined' ? ', USR$SECRETKEY' : ''}
        ${typeof enabled2fa === 'boolean' ? ', USR$2FA_ENABLED' : ''})
      VALUES(:userId
        ${typeof secretKey !== 'undefined' ? ', :secretKey ' : ''}
        ${typeof enabled2fa === 'boolean' ? ', :enabled2fa' : ''})
      MATCHING(USR$USERKEY)`,
      { userId, secretKey, enabled2fa });

    (typeof email !== 'undefined') && await executeSingletonAsObject(
      `UPDATE GD_CONTACT C
      SET EMAIL = :email
      WHERE EXISTS(SELECT u.ID FROM GD_USER u WHERE u.CONTACTKEY = c.ID AND u.ID = :userId )`,
      { userId, email });

    return true;
  } catch (error) {
    console.error('upsertSecretKey', error);
    return false;
  } finally {
    releaseTransaction();
  }
};

const upsertLastIP = async (req: Request, body: { userId: number, ip: string; }) => {
  const { releaseTransaction, executeSingletonAsObject } = await startTransaction(req.sessionID);

  const { userId, ip } = body;

  try {
    await executeSingletonAsObject(
      `UPDATE OR INSERT INTO USR$CRM_PROFILE_SETTINGS(USR$USERKEY, USR$LAST_IP)
      VALUES(:userId, :ip)
      MATCHING(USR$USERKEY)`,
      { userId, ip }
    );
    return true;
  } catch (error) {
    console.error('[ update IP ]', error);
    return false;
  } finally {
    releaseTransaction();
  }
};

const resetSettings: RequestHandler = async (req, res) => {
  const { releaseTransaction, executeSingletonAsObject } = await startTransaction(req.sessionID);

  const userId = parseIntDef(req.params.userId, -1);

  try {
    await executeSingletonAsObject(
      `DELETE FROM USR$CRM_PROFILE_SETTINGS
      WHERE USR$USERKEY = :userId`,
      { userId }
    );

    closeUserSession(req, userId);
    setPermissonsCache();

    const result: IRequestResult = {
      queries: { settings: [{ id: userId }] },
      _params: [{ userId }],
      _schema: {}
    };

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).send(resultError(error.message));
  } finally {
    await releaseTransaction(res.statusCode === 200);
  }
};

export const profileSettingsController = {
  get,
  set,
  getSettings,
  upsertSecretKey,
  upsertLastIP,
  resetSettings
};
