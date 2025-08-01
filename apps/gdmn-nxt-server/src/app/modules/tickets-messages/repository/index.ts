import { acquireReadTransaction, startTransaction } from '@gdmn-nxt/db-connection';
import { FindHandler, FindOneHandler, FindOperator, ITicketMessage, ITicketMessageFile, RemoveOneHandler, SaveHandler, UpdateHandler, UserType } from '@gsbelarus/util-api-types';
import { bin2String } from '@gsbelarus/util-helpers';
import { getStringFromBlob } from 'libs/db-connection/src/lib/convertors';
import { buckets, getBase64MinioFile, minioClient, putBase64MinioFile } from '@gdmn/minio';
const find: FindHandler<ITicketMessage> = async (
  sessionID,
  clause = {},
) => {
  const { fetchAsObject, releaseReadTransaction, attachment, transaction, blob2String } = await acquireReadTransaction(sessionID);

  try {
    const params = [];
    const clauseString = Object
      .keys({ ...clause })
      .map(r => {
        if (typeof clause[r] === 'object' && 'operator' in clause[r]) {
          const expression = clause[r] as FindOperator;
          switch (expression.operator) {
            case 'LIKE':
              return ` UPPER(r.${r}) ${expression.value} `;
          }
        }
        params.push(clause[r]);
        return ` r.${r} = ?`;
      })
      .join(' AND ');

    const sql = `
      SELECT
        COALESCE(
          CUSTOMER.ID,
          SUPPORT.ID
        ) AS USERID,
        COALESCE(
          CUSTOMER.USR$FULLNAME,
          c.NAME
        ) AS NAME,
        COALESCE(
          CUSTOMER.USR$EMAIL,
          c.EMAIL
        ) AS EMAIL,
        COALESCE(
          CUSTOMER.USR$PHONE,
          c.PHONE
        ) AS PHONE,
        COALESCE(
          cps.USR$AVATAR,
          sps.USR$AVATAR
        ) AS AVATAR,
        CASE
          WHEN r.USR$CUSTOMER_AUTHORKEY IS NOT NULL THEN 'user'
          ELSE 'empl'
        END AS TYPE,
        r.ID,
        r.USR$BODY,
        r.USR$STATE,
        r.USR$TICKETKEY,
        r.USR$SENDAT,
        s.ID as STATEID,
        s.USR$NAME as STATE_NAME,
        s.USR$CODE as STATE_CODE
      FROM USR$CRM_TICKETREC r
        LEFT JOIN USR$CRM_USER CUSTOMER ON CUSTOMER.ID = r.USR$CUSTOMER_AUTHORKEY
        LEFT JOIN USR$CRM_T_USER_PROFILE_SETTINGS cps ON cps.USR$USERKEY = CUSTOMER.ID

        LEFT JOIN GD_USER SUPPORT ON SUPPORT.ID = r.USR$SUPPORT_AUTHORKEY
        LEFT JOIN GD_CONTACT c ON c.ID = SUPPORT.CONTACTKEY
        LEFT JOIN USR$CRM_PROFILE_SETTINGS sps ON sps.USR$USERKEY = SUPPORT.ID

        LEFT JOIN USR$CRM_TICKET_STATE s ON s.ID = r.USR$STATE
      ${clauseString.length > 0 ? ` WHERE ${clauseString}` : ''}
      ORDER BY USR$SENDAT`;

    const result = await fetchAsObject<any>(sql, params);

    const getFilesById = async (id: string) => {
      const filesNames = await fetchAsObject<any>(`
        SELECT
          USR$NAME
        FROM USR$CRM_TICKETFILE
        WHERE USR$TICKETRECKEY = ?
        `, [id]);

      const files = [];

      await Promise.all(filesNames.map(async (fileInfo) => {
        const file = await getBase64MinioFile(buckets.ticketMessages, fileInfo['USR$NAME']);
        if (file) files.push(file);
      }));

      return files;
    };

    const messages: ITicketMessage[] = await Promise.all(result.map(async (data) => {
      const avatarBlob = await getStringFromBlob(attachment, transaction, data['AVATAR']);
      const avatar = bin2String(avatarBlob.split(','));

      return {
        ID: data['ID'],
        body: await blob2String(data['USR$BODY']),
        ticketKey: data['USR$TICKETKEY'],
        user: {
          ID: data['USERID'],
          type: data['TYPE'],
          fullName: data['NAME'],
          phone: data['PHONE'],
          email: data['EMAIL'],
          avatar: avatar
        },
        state: {
          ID: data['STATEID'],
          name: data['STATE_NAME'],
          code: data['STATE_CODE']
        },
        sendAt: data['USR$SENDAT'],
        files: await getFilesById(data['ID'])
      };
    }));

    return messages;
  } finally {
    releaseReadTransaction();
  }
};

const findOne: FindOneHandler<ITicketMessage> = async (sessionID, clause = {}) => {
  const message = await find(sessionID, clause);

  if (message.length === 0) {
    return Promise.resolve(undefined);
  }

  return message[0];
};

interface ITicketMessageSave extends Omit<ITicketMessage, 'user'> {
  userId: number;
}

const save: SaveHandler<ITicketMessageSave> = async (
  sessionID,
  metadata,
  type
) => {
  const { fetchAsSingletonObject, releaseTransaction, string2Blob } = await startTransaction(sessionID);

  const { ticketKey, body, state, userId, sendAt, files } = metadata;

  const fieldName = type === UserType.Tickets ? 'USR$CUSTOMER_AUTHORKEY' : 'USR$SUPPORT_AUTHORKEY';

  const blobBody = await string2Blob(body);

  try {
    const message = await fetchAsSingletonObject<ITicketMessageSave>(
      `INSERT INTO USR$CRM_TICKETREC(USR$TICKETKEY, USR$BODY, USR$STATE, USR$SENDAT, ${fieldName})
      VALUES(:TICKETKEY, :BODY, :STATE, :SENDAT, :SENDER)
      RETURNING ID`,
      {
        TICKETKEY: ticketKey,
        BODY: blobBody,
        STATE: state?.ID,
        SENDER: userId,
        SENDAT: sendAt ? new Date(sendAt) : new Date()
      }
    );

    const renameDuplicates = (files: ITicketMessageFile[]) => {
      const names = {};
      return files.map(item => {
        const name = item.fileName;
        if (!names[name]) {
          names[name] = 1;
          return item;
        } else {
          const lastDot = name.lastIndexOf('.');
          const baseName = lastDot !== -1 ? name.slice(0, lastDot) : name;
          const extension = lastDot !== -1 ? name.slice(lastDot) : '';

          const newName = extension ? `${baseName} (${names[name]})${extension}` : `${baseName} (${names[name]})`;
          names[name]++;
          return { ...item, fileName: newName };
        }
      });
    };

    await Promise.all(renameDuplicates(files).map(async (file) => {
      const fileName = `${message.ID}/${file.fileName}`;

      await fetchAsSingletonObject<ITicketMessageSave>(
        `INSERT INTO USR$CRM_TICKETFILE(USR$TICKETRECKEY, USR$NAME)
          VALUES(:TICKETRECKEY, :NAME)
          RETURNING ID
        `,
        {
          TICKETRECKEY: message?.ID,
          NAME: fileName,
        }
      );

      return await putBase64MinioFile(buckets.ticketMessages, fileName, file.content, file.size);
    }));

    await releaseTransaction();

    return message;
  } catch (error) {
    await releaseTransaction(false);
    throw new Error(error);
  }
};

const update: UpdateHandler<ITicketMessage> = async (
  sessionID,
  id,
  metadata,
  type
) => {
  const { fetchAsSingletonObject, releaseTransaction, string2Blob } = await startTransaction(sessionID);

  try {
    const ID = id;

    const {
      body,
      files
    } = metadata;

    const blobBody = await string2Blob(body);

    const updatedMessage = await fetchAsSingletonObject<ITicketMessage>(
      `UPDATE USR$CRM_TICKETREC
      SET
        USR$BODY = :BODY
      WHERE
        ID = :ID
      RETURNING ID`,
      {
        ID,
        BODY: blobBody,
      }
    );

    const oldMessage = await findOne(sessionID, { id: id }, type);

    const fileNames = new Set(files.map(obj => obj.fileName));

    const deleteFiles = oldMessage.files.filter(obj => !fileNames.has(obj.fileName));

    if (minioClient) {
      await Promise.all(deleteFiles.map(async (file) => {
        return await minioClient?.removeObject(buckets.ticketMessages, file.fileName);
      }));
    } else {
      console.error('minioClient не определен');
    }

    await Promise.all(deleteFiles.map(async (file) => {
      await fetchAsSingletonObject<ITicketMessageSave>(
        `DELETE FROM USR$CRM_TICKETFILE WHERE USR$NAME = :NAME
          RETURNING ID
        `,
        {
          NAME: file.fileName,
        }
      );
    }));

    await releaseTransaction();

    return updatedMessage;
  } catch (error) {
    await releaseTransaction(false);
    throw new Error(error);
  }
};

const remove: RemoveOneHandler = async (
  sessionID,
  id,
  type
) => {
  const { fetchAsSingletonObject, releaseTransaction } = await startTransaction(sessionID);

  try {
    const deletedMessage = await fetchAsSingletonObject<{ ID: number; }>(
      `DELETE FROM USR$CRM_TICKETREC WHERE ID = :id
      RETURNING ID`,
      { id }
    );

    await releaseTransaction();

    return !!deletedMessage.ID;
  } catch (error) {
    await releaseTransaction(false);
    throw new Error(error);
  }
};

export const ticketsMessagesRepository = {
  find,
  findOne,
  save,
  update,
  remove
};
