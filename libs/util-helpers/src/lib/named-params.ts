import { Attachment, Transaction } from 'node-firebird-driver-native';
import { parseParams, Parameters } from './sql-param-parser';
import { normalizeToWin1251 } from './normalizeTowin1251';

export const wrapForNamedParams = (attachment: Attachment, transaction: Transaction) => {
  function prepare<T>(fn: (transaction: Transaction, sqlStmt: string, parameters: any[]) => T) {
    return (sqlStmt: string, parameters?: Parameters) => {
      let s;
      let p;
      if (!parameters || Array.isArray(parameters)) {
        s = sqlStmt;
        p = parameters;
      } else {
        const parsed = parseParams(sqlStmt);
        s = parsed.sqlStmt;
        p = parsed.paramNames?.map(p => parameters[p] ?? null);
      }

      p = p?.map(param => {
        if (typeof param === 'string') {
          return normalizeToWin1251(param);
        }
        return param;
      });

      return fn.call(attachment, transaction, s, p);
    };
  };

  return {
    execute: prepare(attachment.execute),
    executeQuery: prepare(attachment.executeQuery),
    executeSingleton: prepare(attachment.executeSingleton),
    executeSingletonAsObject: prepare(attachment.executeSingletonAsObject),
    fetchAsObject: async <T extends object>(sqlStmt: string, parameters?: Parameters): Promise<T[]> => {
      let s;
      let p;

      if (!parameters || Array.isArray(parameters)) {
        s = sqlStmt;
        p = parameters;
      } else {
        const parsed = parseParams(sqlStmt);
        s = parsed.sqlStmt;
        p = parsed.paramNames?.map(p => parameters[p] ?? null);
      }

      p = p?.map(param => {
        if (typeof param === 'string') {
          return normalizeToWin1251(param);
        }
        return param;
      });

      const statement = await attachment.prepare(transaction, s);
      try {
        const resultSet = await statement.executeQuery(transaction, p);
        try {
          return await resultSet.fetchAsObject<T>();
        } finally {
          await resultSet.close();
        }
      } finally {
        await statement.dispose();
      }
    },
    fetchAsSingletonObject: async <T extends Record<string, any>>(sqlStmt: string, parameters?: Parameters): Promise<T> => {
      let s;
      let p;

      if (!parameters || Array.isArray(parameters)) {
        s = sqlStmt;
        p = parameters;
      } else {
        const parsed = parseParams(sqlStmt);
        s = parsed.sqlStmt;
        p = parsed.paramNames?.map(p => parameters[p] ?? null);
      }

      p = p?.map(param => {
        if (typeof param === 'string') {
          return normalizeToWin1251(param);
        }
        return param;
      });

      const statement = await attachment.prepare(transaction, s);
      try {
        const resultSet = await statement.executeQuery(transaction, p);
        try {
          const result = await resultSet.fetchAsObject<T>();
          return (result.length === 0 ? {} : result[0]) as any;
        } finally {
          await resultSet.close();
        }
      } finally {
        await statement.dispose();
      }
    },
  };
};

