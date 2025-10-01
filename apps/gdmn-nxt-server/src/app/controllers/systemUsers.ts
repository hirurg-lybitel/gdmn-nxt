import { IRequestResult } from '@gsbelarus/util-api-types';
import { RequestHandler } from 'express';
import { resultError } from '../responseMessages';
import { getReadTransaction, releaseReadTransaction } from '@gdmn-nxt/db-connection';
import { getStringFromBlob } from 'libs/db-connection/src/lib/convertors';
import { bin2String } from '@gsbelarus/util-helpers';

export const get: RequestHandler = async (req, res) => {
  const { attachment, transaction } = await getReadTransaction(req.sessionID);

  const { id } = req.params;

  try {
    const _schema = {};

    const execQuery = async ({ name, query, params }: { name: string, query: string, params?: any[]; }) => {
      const rs = await attachment.executeQuery(transaction, query, params);
      try {
        const data = await rs.fetchAsObject();

        const formattedData = data.map((d: any) => {
          const CONTACT = { ID: d['CONTACT_ID'], NAME: d['CONTACT_NAME'] };
          const { CONTACT_ID, CONTACT_NAME, ...newObject } = d;
          return { ...newObject, CONTACT };
        });

        return [name, id ? formattedData.length > 0 ? formattedData[0] : {} : formattedData];
      } finally {
        await rs.close();
      }
    };

    const queries = [{
      name: id ? 'user' : 'users',
      query: `
          SELECT
            u.ID,
            u.NAME,
            u.FULLNAME,
            u.DISABLED,
            con.ID AS CONTACT_ID,
            con.NAME AS CONTACT_NAME,
            con.EMAIL,
            con.PHONE,
            ps.USR$AVATAR
          FROM GD_USER u
          JOIN GD_CONTACT con ON con.ID = u.CONTACTKEY
          LEFT JOIN USR$CRM_PROFILE_SETTINGS ps ON ps.USR$USERKEY = u.ID
          WHERE u.disabled = 0 ${id ? 'AND u.ID = ?' : ''}`,
      params: id ? [id] : undefined,
    }];

    const data = Object.fromEntries(await Promise.all(queries.map(execQuery)));

    const users = await Promise.all((data.users ?? []).map(async (item) => {
      const newUser = { ...item };

      const avatarBlob = await getStringFromBlob(attachment, transaction, item['USR$AVATAR']);
      const avatar = bin2String(avatarBlob.split(','));

      newUser.avatar = avatar;
      delete newUser['USR$AVATAR'];

      return newUser;
    }));

    const result: IRequestResult = {
      queries: {
        users: users
      },
      _params: id ? [{ id: id }] : undefined,
      _schema
    };

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).send(resultError(error.message));
  } finally {
    await releaseReadTransaction(req.sessionID);
  }
};

export default { get };
