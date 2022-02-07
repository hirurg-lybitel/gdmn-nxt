import { Semaphore } from '@gsbelarus/util-useful';
import { Client, Attachment, createNativeClient, getDefaultLibraryFilename, Transaction, TransactionIsolation } from 'node-firebird-driver-native';
import { config } from "./db-config";

const { host, port, db, username, password } = config;

let client: Client;

interface IDBSession {
  lock: number;
  touched: number;
  attachment: Attachment;
  readTransaction?: Transaction;
};

interface IDBSessions {
  [sessionId: string]: IDBSession;
};

const sessions: IDBSessions = {};
const semaphore = new Semaphore('dbSessions');

/** Minimal time of life of open unused attachment */
const minTimeOfLife = 60 * 60 * 1000;

const releaseSessions = () => {
  const t = new Date().getTime();
  return Promise.all(Object.values(sessions).map(
    async (s) => {
      const { lock, attachment, readTransaction, touched } = s;
      if (!lock && (t - touched) > minTimeOfLife) {
        if (readTransaction?.isValid) {
          await readTransaction.commit();
        }

        if (attachment.isValid) {
          await attachment.disconnect();
        }
      }
    }
  ));
};

const cleanupInterval = setInterval(
  async () => {
    await semaphore.acquire();
    try {
      await releaseSessions();
    } finally {
      semaphore.release();
    }
  }, 
  minTimeOfLife
);

export const getDBSession = async (sessionId: string) => {
  if (!client?.isValid) {
    client = createNativeClient(getDefaultLibraryFilename());
  }

  await semaphore.acquire();
  try {
    let session = sessions[sessionId];
  
    if (!session?.attachment.isValid) {
      const attachment = await client.connect(`${host}/${port}:${db}`, { username, password });
      session = {
        lock: 1,
        touched: new Date().getTime(),
        attachment
      };
      sessions[sessionId] = session;   
    } else {
      session.lock += 1;
    }
    return session;
  } finally {
    semaphore.release();
  }
};

export const releaseDBSession = async (sessionId: string) => {
  await semaphore.acquire();
  try {
    const session = sessions[sessionId];
  
    if (!session?.attachment.isValid) {
      throw new Error(`Invalid attachment in session ${sessionId}`);
    }
    
    if (session.lock < 1) {   
      throw new Error(`Invalid lock value ${session.lock} in session ${sessionId}`);
    }
  
    session.lock -= 1;
    session.touched = new Date().getTime();
  } finally {
    semaphore.release();
  }
};

export const getAttachment = async (sessionId: string) => (await getDBSession(sessionId)).attachment;
export const releaseAttachment = (sessionId: string) => releaseDBSession(sessionId);

export const getReadTransaction = async (sessionId: string) => {
  if (!client?.isValid) {
    client = createNativeClient(getDefaultLibraryFilename());
  }

  await semaphore.acquire();
  try {
    let dbSession = sessions[sessionId];
  
    if (!dbSession?.attachment.isValid) {
      const attachment = await client.connect(`${host}/${port}:${db}`, { username, password });
      const readTransaction = await attachment.startTransaction({ 
        isolation: TransactionIsolation.READ_COMMITTED, 
        readCommittedMode: 'RECORD_VERSION', 
        waitMode: 'NO_WAIT',
        accessMode: 'READ_ONLY' 
      });
      dbSession = {
        lock: 1,
        touched: new Date().getTime(),
        attachment,
        readTransaction
      };
      sessions[sessionId] = dbSession;   
    } else {
      dbSession.lock += 1;

      if (!dbSession.readTransaction?.isValid) {
        dbSession.readTransaction = await dbSession.attachment.startTransaction({ 
          isolation: TransactionIsolation.READ_COMMITTED, 
          readCommittedMode: 'RECORD_VERSION', 
          waitMode: 'NO_WAIT',
          accessMode: 'READ_ONLY' 
        });        
      }
    }
    return { attachment: dbSession.attachment, transaction: dbSession.readTransaction };
  } finally {
    semaphore.release();
  } 
};

export const releaseReadTransaction = async (sessionId: string) => {
  await semaphore.acquire();
  try {
    const dbSession = sessions[sessionId];

    if (!dbSession?.readTransaction?.isValid) {
      throw new Error(`No active read transaction in session ${sessionId}`);
    }

    if (dbSession?.lock < 1) {
      throw new Error(`Db session ${sessionId} is not locked`);
    }

    dbSession.lock -= 1;
    dbSession.touched = new Date().getTime();
  } finally {
    semaphore.release();
  }
};

export const startTransaction = async (sessionId: string) => {
  const attachment = await getAttachment(sessionId);
  const transaction = await attachment.startTransaction({ 
    isolation: TransactionIsolation.READ_COMMITTED, 
    readCommittedMode: 'RECORD_VERSION', 
    waitMode: 'NO_WAIT' 
  });
  return { attachment, transaction };
};

export const releaseTransaction = async (sessionId: string, transaction: Transaction) => {
  if (transaction.isValid) {
    await transaction.commit();
  }
  await releaseAttachment(sessionId);
};

export const commitTransaction = async (sessionId: string, transaction: Transaction) => {
  if (transaction.isValid) {
    await transaction.commit();
  }
  await releaseAttachment(sessionId);
};

export const rollbackTransaction = async (sessionId: string, transaction: Transaction) => {
  if (transaction.isValid) {
    await transaction.rollback();
  }
  await releaseAttachment(sessionId);
};

export const disposeConnection = async () => {
  await semaphore.acquire();
  try {
    clearInterval(cleanupInterval);
    if (client?.isValid) {
      await client.dispose();
    }
  } finally {
    semaphore.release();
  }
}; 
