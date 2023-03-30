import { resultError } from 'apps/gdmn-nxt-server/src/app/responseMessages';
import { getReadTransaction, releaseReadTransaction } from '../utils/db-connection';
import NodeCache from 'node-cache';

export const permissionsActionsCache = new NodeCache()

export const updatePermissonsCache = async (req:any) => {
  const userID = req.cookies.userId;
  if (isNaN(userID)) return {result:false,message:'mustAuthWithPermissions: Поле "userID" не указано или неверного типа'}
  try{
    const { attachment, transaction } = await getReadTransaction(req.sessionID);
    const execQuery = async ({name, query, params }: {name:string, query: string, params?: any[] }) => {
      const rs = await attachment.executeQuery(transaction, query, params);
      const data = await rs.fetchAsObject();
      await rs.close();
      return [name, data];
    };
    const query = {
      name:'actions',
      query: `
        SELECT cr.USR$MODE MODE, act.USR$CODE CODE
        FROM USR$CRM_PERMISSIONS_CROSS cr
          JOIN USR$CRM_PERMISSIONS_ACTIONS act ON act.ID = cr.USR$ACTIONKEY
          JOIN USR$CRM_PERMISSIONS_USERGROUPS ug ON ug.ID = cr.USR$GROUPKEY
          JOIN USR$CRM_PERMISSIONS_UG_LINES line ON line.USR$GROUPKEY = ug.ID
        WHERE
          line.USR$USERKEY = ?`,
      params: [ userID ]
    };
    const result = Object.fromEntries([await Promise.resolve(execQuery(query))])
    permissionsActionsCache.mset(result.actions.map(item=> {return { key:item.CODE, val: item.MODE }}))
    return {result:true,message:'update successful'}
  }catch(err){
    return {result:false,message:err.message}
  }
}

export const checkPermissionsMW = (actionCode:number) => async (req, res, next) => {
  if (isNaN(actionCode)) return res.status(500).send(resultError('mustAuthWithPermissions: Поле "actionCode" не указано или неверного типа'));
  try {
    if(!permissionsActionsCache.get(actionCode)){
      const result = await updatePermissonsCache(req)
      if(!result.result) return res.status(500).send(resultError(result.message));
    }
    if (permissionsActionsCache.get(actionCode) !== 1) return res.status(403).send(resultError('У вас нет прав для этого'));
    next();
  } catch (error) {
    return res.status(500).send(resultError(error.message));
  } finally {
    await releaseReadTransaction(req.sessionID);
  };
};
