import { resultError } from 'apps/gdmn-nxt-server/src/app/responseMessages';
import { decrypt } from '../../cypher';
import { getReadTransaction, releaseReadTransaction } from '../utils/db-connection';

export const checkPermissionsMW = (actionCode:number) => async (req, res, next) => {
  const { attachment, transaction } = await getReadTransaction(req.sessionID);
  if (isNaN(actionCode)) console.log('mustAuthWithPermissions: Поле "actionCode" не указано или неверного типа');
  const userID = Number(decrypt(req.cookies.userId));
  if (isNaN(userID)) console.log('mustAuthWithPermissions: Поле "userID" не указано или неверного типа');
  try {
    const _schema = {};
    const execQuery = async ({ name, query, params }: { name: string, query: string, params?: any[] }) => {
      // const data = await attachment.executeSingletonAsObject(transaction, query, params);
      // return [name, data];
      const rs = await attachment.executeQuery(transaction, query, params);
      const data = await rs.fetchAsObject();
      await rs.close();
      return [name, data[0]];
    };
    const query = {
      name: 'action',
      query: `
        SELECT cr.USR$MODE MODE, act.USR$CODE CODE
        FROM USR$CRM_PERMISSIONS_CROSS cr
          JOIN USR$CRM_PERMISSIONS_ACTIONS act ON act.ID = cr.USR$ACTIONKEY
          JOIN USR$CRM_PERMISSIONS_USERGROUPS ug ON ug.ID = cr.USR$GROUPKEY
          JOIN USR$CRM_PERMISSIONS_UG_LINES line ON line.USR$GROUPKEY = ug.ID
        WHERE
          act.USR$CODE = ?
          AND line.USR$USERKEY = ?
        ROWS 1`,
      params: [actionCode, userID]
    };
    // const action = await Promise.resolve(execQuery(query));
    const result = {
      ...Object.fromEntries([await Promise.resolve(execQuery(query))])
    };
    if (result.action.MODE !== 1) return res.status(403).send(resultError('you don\'t have the rights to do this'));
    next();
  } catch (error) {
    return res.status(500).send(resultError(error.message));
  } finally {
    await releaseReadTransaction(req.sessionID);
  };
};