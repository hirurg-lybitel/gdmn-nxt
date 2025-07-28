import { UserType } from './crmDataTypes';

export type SortMode = 'ASC' | 'DESC';

/**
 * Finds all entities that match given find clause.
 * If entities was not found in the database - returns empty array.
 * @param sessionID Session identifier
 * @param clause The find clause object
 */
export type FindHandler<T = object> = (sessionID: string, clause?: object, order?: { [key: string]: SortMode; }, type?: UserType) => Promise<T[]>;

/**
 * Finds first entity that match given find clause.
 * If entities was not found in the database - returns empty array.
 * @param sessionID Session identifier
 * @param clause The find clause object
 */
export type FindOneHandler<T = object> = (sessionID: string, clause?: object, type?: UserType) => Promise<T>;

/**
 * Update entity by id.
 * @param sessionID Session identifier
 * @param id uniq id of the entity
 * @param metadata the entity
 */
export type UpdateHandler<T = object> = (sessionID: string, id: number, metadata: Omit<Partial<T>, 'ID' | 'id'>, type?: UserType) => Promise<T>;

/**
 * Save entity.
 * @param sessionID Session identifier
 * @param metadata the entity
 */
export type SaveHandler<T = object> = (sessionID: string, metadata: Omit<T, 'ID' | 'id'>, type?: UserType) => Promise<T>;

/**
 * Delete entities by clause.
 * @param sessionID Session identifier
 * @param clause The find clause object
 */
export type RemoveHandler = (sessionID: string, clause?: object) => Promise<Boolean>;

/**
 * Delete entity.
 * @param sessionID Session identifier
 * @param id uniq id of entity
 */
export type RemoveOneHandler = (sessionID: string, id: number, type?: UserType) => Promise<Boolean>;
