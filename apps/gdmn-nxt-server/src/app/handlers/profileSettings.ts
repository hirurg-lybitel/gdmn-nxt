import { IProfileSettings, IRequestResult } from "@gsbelarus/util-api-types";
import { parseIntDef } from "@gsbelarus/util-useful";
import { RequestHandler } from "express";
import { resultError } from "../responseMessages";
import { acquireReadTransaction, getReadTransaction, startTransaction } from "../utils/db-connection";
import { bin2String, string2Bin } from "@gsbelarus/util-helpers";

const get: RequestHandler = async (req, res) => {
  const { releaseReadTransaction, fetchAsObject } = await acquireReadTransaction(req.sessionID);
  const { attachment, transaction } = await getReadTransaction(req.sessionID);

  const userId = parseIntDef(req.params.userId, -1);

  try {
    const sqlResult = await fetchAsObject(`
      SELECT
        p.RANK, ps.USR$AVATAR as AVATAR_BLOB
      FROM GD_USER u
      JOIN GD_PEOPLE p ON p.CONTACTKEY = u.CONTACTKEY
      LEFT JOIN USR$CRM_PROFILE_SETTINGS ps ON ps.USR$USERKEY = u.ID
      WHERE u.ID = :userId`, { userId });

    for (const r of sqlResult) {
      if (r['AVATAR_BLOB'] !== null && typeof r['AVATAR_BLOB'] === 'object') {
        const readStream = await attachment.openBlob(transaction, r['AVATAR_BLOB']);
        const blobLength = await readStream.length;
				const resultBuffer = Buffer.alloc(blobLength);

        let size = 0;
				let n: number;
				while (size < blobLength && (n = await readStream.read(resultBuffer.subarray(size))) > 0)
					size += n;

				await readStream.close();

        const blob2String = resultBuffer.toString();
        r['AVATAR'] = bin2String(blob2String.split(','));
      };
      delete r['AVATAR_BLOB'];
    };

    const result: IRequestResult<{settings: IProfileSettings}> = {
      queries: { settings: sqlResult[0] as IProfileSettings },
      _params: [{ userId }],
      _schema: {}
    };
    return res.status(200).json(result);

  } catch (error) {
    return res.status(500).send(resultError(error.message));

  } finally {
    releaseReadTransaction();
  }
};

const set: RequestHandler = async (req, res) => {
  const { attachment, transaction, releaseTransaction, fetchAsObject } = await startTransaction(req.sessionID);

  const userId = parseIntDef(req.params.userId, -1);

  const { AVATAR: avatar } = req.body;

  try {
    const charArray = string2Bin(avatar);
    const charArrayString = charArray.toString();
    const blobBuffer = Buffer.alloc(charArrayString.length, charArrayString);
    const blob = await attachment.createBlob(transaction);
    await blob.write(blobBuffer);
    await blob.close();

    const sqlResult = await fetchAsObject(`
      UPDATE OR INSERT INTO USR$CRM_PROFILE_SETTINGS(USR$USERKEY, USR$AVATAR)
      VALUES(:userId, :avatar)
      MATCHING(USR$USERKEY)
      RETURNING ID`,
      { userId, avatar: blob});

    const result: IRequestResult = {
      queries: { settings: sqlResult },
      _schema: {}
    };

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).send(resultError(error.message));
  } finally {
    releaseTransaction();
  }

};

export default { get, set };
