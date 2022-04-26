import { parseParams } from '@gsbelarus/util-helpers';
import { RequestHandler } from 'express';
import { resultError } from '../responseMessages';
import { acquireReadTransaction, getReadTransaction, releaseReadTransaction } from '../utils/db-connection';

const getHistory: RequestHandler = async(req, res) => {
  const { releaseReadTransaction, fetchAsObject } = await acquireReadTransaction(req.sessionID);
  try {

    const sql = `
      SELECT
        C.NAME AS CREATOR,
        Z.ID,
        Z.SQL_TEXT,
        Z.SQL_PARAMS,
        Z.BOOKMARK,
        Z.CREATORKEY,
        Z.CREATIONDATE,
        Z.EDITORKEY,
        Z.EDITIONDATE,
        Z.EXEC_COUNT

      FROM
        GD_SQL_HISTORY Z
          JOIN
            GD_CONTACT C
          ON
            Z.CREATORKEY  =  C.ID

      WHERE
        COALESCE ( Z.BOOKMARK, ' ' )  <>  'M'
      ORDER BY
        Z.EDITIONDATE DESC,
        Z.ID DESC
    `;

    const result = parseParams(sql);

    let sqlResult = await fetchAsObject(sql);
    return res.status(200).json(sqlResult);

  } catch (error) {
    return res.status(500).send(resultError(error.message));
  } finally {
    releaseReadTransaction();

  }
};


const executeScript: RequestHandler = async(req, res) => {
  return res.status(200).json('executeScript');
};

export default { getHistory, executeScript };
