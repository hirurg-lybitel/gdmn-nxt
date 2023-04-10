import { resultError } from 'apps/gdmn-nxt-server/src/app/responseMessages';
import { getReadTransaction, releaseReadTransaction } from '../utils/db-connection';
import NodeCache from 'node-cache';
import { useedApi } from '../../main';
import { pathsWithPermissons } from '../pathsWithPermissons';
import { Action } from '@gsbelarus/util-api-types';

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

type routerName = 'faq' | 'labels' | 'kanban' | 'permissons'
interface codesMas {
  get:number,
  post:number,
  put: number,
  delete:number
}

const createCodesMas = (g:number,p:number,u:number,d:number):codesMas => ({
  get:g,
  post:p,
  put:u,
  delete:d
})

const baseSwitch = (method:string,routerName:routerName):number => {
  const codes:codesMas = (():codesMas=>{
    switch(routerName){
      case 'faq': return createCodesMas(-1,Action.CreateFAQ,Action.EditFAQ,Action.DeleteFAQ)
      case 'kanban': return createCodesMas(-1,Action.CreateDeal,Action.EditDeal,Action.DeleteDeal)
      case 'labels': return createCodesMas(-1,Action.CreateLabel,Action.EditLabel,Action.DeleteLabel)
      case 'permissons': return createCodesMas(Action.PermissionsSettings,Action.PermissionsSettings,Action.PermissionsSettings,Action.PermissionsSettings)
      default: return undefined
    }
  })()
  switch(method){
    case 'GET': return (codes.get < 0 ? undefined : codes.get)
    case 'POST': return (codes.post < 0 ? undefined : codes.post)
    case "PUT": return (codes.put < 0 ? undefined : codes.put)
    case "DELETE": return (codes.delete < 0 ? undefined : codes.delete)
    default: return undefined
  }
}

export const checkPermissionsMW = async (req, res, next) => {
  const firstPartOfPath = '/' + req.originalUrl.split(useedApi)[1].split('/')[1]
  const endpointPath = req.originalUrl.split(useedApi)[1]
  const actionCode = (():number => {
    switch(firstPartOfPath){
      case pathsWithPermissons.faq: switch(endpointPath){
        // case 'some path': return Actions.SomeAction
        default: return baseSwitch(req.method,'faq')
      }
      case pathsWithPermissons.labels: switch(endpointPath){
        // case 'some path': return Actions.SomeAction
        default: return baseSwitch(req.method,'labels')
      }
      case pathsWithPermissons.permissions: switch(endpointPath){
        // case 'some path': return Actions.SomeAction
        default: return baseSwitch(req.method,'permissons')
      }
      case pathsWithPermissons.kanban: switch(endpointPath){
        // case 'some path': return Actions.SomeAction
        default: return baseSwitch(req.method,'kanban')
      }
      default: undefined
    }
  })()
  if (isNaN(actionCode)) return res.status(500).send(resultError('Не удалось проверить права'));
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
