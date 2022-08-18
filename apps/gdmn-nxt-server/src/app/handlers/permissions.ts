import { IRequestResult } from '@gsbelarus/util-api-types';
import { raw, RequestHandler } from 'express';
import { resultError } from '../responseMessages';
import { getReadTransaction, releaseReadTransaction } from '../utils/db-connection';

const getCross: RequestHandler = async (req, res) => {
  const { attachment, transaction } = await getReadTransaction(req.sessionID);

  try {
    const _schema = {};

    const execQuery = async (query: string) => {
      const aTime = new Date().getTime();
      const rs = await attachment.executeQuery(transaction, query, []);
      const data = await rs.fetchAsObject();
      console.log(`fetch time ${new Date().getTime() - aTime} ms`);
      await rs.close();

      return data as any;
    };

    const queries = [
      `SELECT
        cr.ID,
        cr.USR$ACTIONKEY,
        cr.USR$GROUPKEY,
        cr.USR$MODE
      FROM USR$CRM_PERMISSIONS_CROSS cr
      JOIN USR$CRM_PERMISSIONS_ACTIONS act ON act.ID = cr.USR$ACTIONKEY
      JOIN USR$CRM_PERMISSIONS_USERGROUPS ug ON ug.ID = cr.USR$GROUPKEY`,
      `SELECT act.ID, act.USR$NAME
      FROM USR$CRM_PERMISSIONS_ACTIONS act`,
      `SELECT ug.ID, ug.USR$NAME
      FROM USR$CRM_PERMISSIONS_USERGROUPS ug`
    ];

    const [rawCross, rawActions, rawUserGroups] = await Promise.all(queries.map(execQuery));

    interface IMapOfArrays {
      [key: string]: any[];
    };

    // const cross: IMapOfArrays = {};
    const actions: IMapOfArrays = {};
    const userGroup: IMapOfArrays = {};

    const cross = rawCross.map(c => {
      const ACTION = rawActions.filter(act => act['ID'] === c['USR$ACTIONKEY'])[0];
      const USERGROUP = rawUserGroups.filter(ug => ug['ID'] === c['USR$GROUPKEY'])[0];
      return { ...c, ACTION, USERGROUP };
    });

    const result: IRequestResult = {
      queries: {
        cross,
        actions: rawActions,
        userGroups: rawUserGroups
      },
      _schema
    };

    return res.status(200).send(result);
  } catch (error) {
    return res.status(500).send(resultError(error.message));
  } finally {
    await releaseReadTransaction(req.sessionID);
  }
};

const updateCross: RequestHandler = async (req, res) => {

};

const getUserGroups: RequestHandler = async (req, res) => {
  const { attachment, transaction } = await getReadTransaction(req.sessionID);

  try {
    const execQuery = async (query: string) => {
      const rs = await attachment.executeQuery(transaction, query, []);
      const data = await rs.fetchAsObject();
      await rs.close();

      return data as any;
    };

    const queries = [
      `SELECT ug.ID, ug.USR$NAME
      FROM USR$CRM_PERMISSIONS_USERGROUPS ug`
    ];

    const [rawCross, rawActions, rawUserGroups] = await Promise.all(queries.map(execQuery));

    interface IMapOfArrays {
      [key: string]: any[];
    };

    // const cross: IMapOfArrays = {};
    const actions: IMapOfArrays = {};
    const userGroup: IMapOfArrays = {};

    const cross = rawCross.map(c => {
      const ACTION = rawActions.filter(act => act['ID'] === c['USR$ACTIONKEY'])[0];
      const USERGROUP = rawUserGroups.filter(ug => ug['ID'] === c['USR$GROUPKEY'])[0];
      return { ...c, ACTION, USERGROUP };
    });

    // rawActions.forEach(action =>
    //   if (actions[act]);


    return res.status(200).send(cross);
  } catch (error) {
    return res.status(500).send(resultError(error.message));
  } finally {
    await releaseReadTransaction(req.sessionID);
  }
};

const upsertGroup: RequestHandler = async (req, res) => {
};


const removeGroup: RequestHandler = async (req, res) => {
};

const getActions: RequestHandler = async (req, res) => {};

export default { getCross, updateCross, upsertGroup, removeGroup };
