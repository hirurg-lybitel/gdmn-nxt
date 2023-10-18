import NodeCache from 'node-cache';

type Key = string | number;

interface Options extends NodeCache.Options {};

export interface CacheManager {
  init: (options?: Options) => void;
  getData: <T = object[]>(key: Key, callbackFn: () => Promise<T>) => Promise<T>;
  setKey: <T>(key: Key, value: T, ttl?: number | string) => Promise<boolean>;
  getKey: <T>(key: Key) => Promise<T>;
  invalidateKey: (key: Key) => Promise<boolean>;
  keyExists: (key: Key) => Promise<boolean>;
  listKeys: () => Promise<string[]>;
  readonly isInit: boolean;
}

let caching: NodeCache = null;

function init(options?: Options) {
  caching = new NodeCache(options);
}

async function getData<T = object[]>(key: Key, callbackFn: () => Promise<T>): Promise<T> {
  const cachedData = await getKey<T>(key);

  if (cachedData) {
    return cachedData;
  };

  const nonCachedData = callbackFn();

  setKey(key, nonCachedData);
  return nonCachedData;
}

async function getKey<T>(key: Key): Promise<T | undefined> {
  if (!caching) return void 0;
  if (!caching.has(key)) return void 0;

  return caching.get(key);
}

/**
 * Установить значение ключа
 *
 * @param key ключ кэша
 * @param value значение
 * @param ttl время жизни
 */
async function setKey<T>(key: Key, value: T, ttl?: number | string): Promise<boolean> {
  if (!caching) return false;

  return caching.set(key, value, ttl);
}

async function invalidateKey(key: Key): Promise<boolean> {
  return caching.del(key) === 1;
}

async function keyExists(key: Key): Promise<boolean> {
  return caching.has(key);
}

async function listKeys(): Promise<string[]> {
  return caching.keys();
}

export const cacheManager: CacheManager = {
  init,
  getData,
  setKey,
  getKey,
  invalidateKey,
  keyExists,
  listKeys,
  get isInit() {
    return !!caching;
  }
};
