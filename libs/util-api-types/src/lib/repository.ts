/**
 * Finds all entities that match given find clause.
 * If entities was not found in the database - returns empty array.
 * @param sessionID Session identifier
 * @param clause The find clause object
 */
export type FindHandler<T = object> = (sessionID: string, clause: object) => Promise<T[]>;
