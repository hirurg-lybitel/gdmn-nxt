import { RequestHandler } from 'express';
import { acquireReadTransaction } from '../utils/db-connection';
import { nodeCache } from '../utils/cache';
import { parseIntDef } from '@gsbelarus/util-useful';
import { ActionName, Permissions } from '@gsbelarus/util-api-types';
import { resultError } from '../responseMessages';
import { config } from '@gdmn-nxt/config';

export const checkPermissions: RequestHandler = (req, res, next) => {
  const apiAccessKey = req.headers['x-api-key'] as string;
  if (!req.isAuthenticated()) {
    if (!!apiAccessKey && apiAccessKey !== config.apiAccessToken) {
      return res.status(401).send(resultError('Ваш сеанс отключён. Повторно войдите в систему'));
    };
  };
  const { userId, permissions } = req.session;
  const { url, method } = req;

  for (const name in permissions) {
    const methods = permissions[name as ActionName] ;
    const regEx = (() => 'forGroup' in methods
      ? new RegExp(`\\/[^\/]*\\b${name}\\b`)
      : new RegExp(`\\/[^\\/]*\\b${name}\\b\\/?\\d*$`))();

    if (!regEx.test(url)) continue;

    // /** Если это групповое право и оно true */
    // if (methods.forGroup) {
    //   next();
    // }

    // /** Если текущий метод для текущего роута разрешён */
    // if(methods[method]) {
    //   next();
    // }

    /** Если текущий метод для текущего роута запрещён */
    /** Если это групповое право и оно false */
    if (method in methods && !methods[method] ||
      'forGroup' in methods && !methods.forGroup) {
      console.error('Access denied', userId, req.sessionID, method, name);
      return res.status(403).send(resultError('У вас недостаточно прав'));
    }
  }
  return next();
};

export const setPermissonsCache = async () => {
  const { fetchAsObject, releaseReadTransaction } = await acquireReadTransaction('permissions');
  try {
    const query = `
      SELECT
        u.ID AS USERID, cr.USR$MODE MODE, act.USR$NAME ACTIONNAME, act.USR$METHOD METHOD, act.USR$ISGROUP ISGROUP
      FROM USR$CRM_PERMISSIONS_CROSS cr
        JOIN USR$CRM_PERMISSIONS_ACTIONS act ON act.ID = cr.USR$ACTIONKEY
        JOIN USR$CRM_PERMISSIONS_USERGROUPS ug ON ug.ID = cr.USR$GROUPKEY
        JOIN USR$CRM_PERMISSIONS_UG_LINES line ON line.USR$GROUPKEY = ug.ID
        JOIN GD_USER u ON u.ID = line.USR$USERKEY
      WHERE
        u.DISABLED = 0
      ORDER BY
        USERID, ACTIONNAME`;

    const permissions = await fetchAsObject(query);
    const permissionsMap: {[key: number]: Permissions} = {};

    permissions.forEach(p => {
      permissionsMap[parseIntDef(p['USERID'], -1)] = {
        ...permissionsMap[p['USERID']],
        [p['ACTIONNAME']]: {
          ...permissionsMap[p['USERID']]?.[p['ACTIONNAME']],
          [parseIntDef(p['ISGROUP'], 0) === 1 ? 'forGroup' : p['METHOD']]: Boolean(parseIntDef(p['MODE'], 0))
        }
      };
    });

    nodeCache.set('permissions', permissionsMap);
    return true;
  } catch (err) {
    console.error('setPermissonsCache', err.message);
    return false;
  } finally {
    await releaseReadTransaction();
  }
};
