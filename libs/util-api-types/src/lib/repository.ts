/**
 * Finds all entities that match given find clause.
 * If entities was not found in the database - returns empty array.
 * @param sessionID Session identifier
 * @param clause The find clause object
 */
export type FindHandler<T = object> = (sessionID: string, clause?: object) => Promise<T[]>;

/**
 * Finds first entity that match given find clause.
 * If entities was not found in the database - returns empty array.
 * @param sessionID Session identifier
 * @param clause The find clause object
 */
export type FindOneHandler<T = object> = (sessionID: string, clause?: object) => Promise<T>;

/**
 * Update entity by id.
 * @param sessionID Session identifier
 * @param id uniq id of the entity
 * @param metadata the entity
 */
export type UpdateHandler<T = object> = (sessionID: string, id: number, metadata: Omit<T, 'ID'>) => Promise<T>;

/**
 * Save entity.
 * @param sessionID Session identifier
 * @param metadata the entity
 */
export type SaveHandler<T = object> = (sessionID: string, metadata: Omit<T, 'ID'>) => Promise<T>;
