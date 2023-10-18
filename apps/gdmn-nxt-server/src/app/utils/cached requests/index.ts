import { CacheManager } from '@gdmn-nxt/cache-manager';
import { requests } from './assets/requests';
import { acquireReadTransaction } from '@gdmn-nxt/db-connection';
export * from './types';

let usingCacheManager: CacheManager;
const timeLabel = 'Cache data';

async function init(cacheManager: CacheManager) {
  if (!cacheManager.isInit) return;

  usingCacheManager = cacheManager;

  const { fetchAsObject, releaseReadTransaction } = await acquireReadTransaction('cache-manager');

  try {
    console.time(timeLabel);
    const queries = [];

    for (const [name, query] of Object.entries(requests)) {
      queries.push({
        name,
        query
      });
    }

    const execQuery = async ({ name, query }) => {
      const data = await fetchAsObject(query);
      return { name, data };
    };

    console.timeLog(timeLabel, 'fetch started');

    const queriesResults = await Promise.all(queries.map(execQuery));

    console.timeLog(timeLabel, 'Fetch ended');

    queriesResults.forEach(({ name, data }) => usingCacheManager.setKey(name, data));
  } catch (error) {
    console.error(error);
  } finally {
    await releaseReadTransaction();
    console.timeEnd(timeLabel);
  }
};

/** Кешировать результат указанного запроса
 @param requestName ключ запроса
*/
async function cacheRequest(requestName: keyof typeof requests) {
  const { fetchAsObject, releaseReadTransaction } = await acquireReadTransaction('cache-manager');
  try {
    const data = await fetchAsObject(requests[requestName]);
    usingCacheManager.setKey(requestName, data);
  } catch (error) {
    console.error(error);
  } finally {
    await releaseReadTransaction();
  }
}

export const cachedRequets = {
  init,
  cacheRequest
};
