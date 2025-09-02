import { acquireReadTransaction, startTransaction } from '@gdmn-nxt/db-connection';
import { FindHandler, FindOneHandler, FindOperator, ILabel, RemoveOneHandler, SaveHandler, UpdateHandler } from '@gsbelarus/util-api-types';

const find: FindHandler<ILabel> = async (
  sessionID,
  clause = {},
) => {
  const { fetchAsObject, releaseReadTransaction } = await acquireReadTransaction(sessionID);

  try {
    const params = [];
    const clauseString = Object
      .keys({ ...clause })
      .map(l => {
        if (typeof clause[l] === 'object' && 'operator' in clause[l]) {
          const expression = clause[l] as FindOperator;
          switch (expression.operator) {
            case 'LIKE':
              return ` UPPER(${l}) ${expression.value} `;
          }
        }
        params.push(clause[l]);
        return ` ${l} = ?`;
      })
      .join(' AND ');

    const sql = `
      SELECT ID, USR$NAME, USR$COLOR, USR$DESCRIPTION, USR$ICON
        FROM USR$CRM_T_LABELS l
      ${clauseString.length > 0 ? ` WHERE ${clauseString}` : ''}`;

    const result = await fetchAsObject<any>(sql, params);

    return result;
  } finally {
    releaseReadTransaction();
  }
};

const findOne: FindOneHandler<ILabel> = async (sessionID, clause = {}) => {
  const label = await find(sessionID, clause);

  if (label.length === 0) {
    return Promise.resolve(undefined);
  }

  return label[0];
};

const save: SaveHandler<ILabel> = async (
  sessionID,
  metadata
) => {
  const { fetchAsSingletonObject, releaseTransaction } = await startTransaction(sessionID);

  const { USR$NAME, USR$COLOR, USR$DESCRIPTION, USR$ICON } = metadata;

  try {
    const label = await fetchAsSingletonObject<ILabel>(
      `INSERT INTO USR$CRM_T_LABELS(USR$NAME, USR$COLOR, USR$DESCRIPTION, USR$ICON)
      VALUES(:NAME, :COLOR, :DESCRIPTION, :ICON)
      RETURNING ID
      `,
      {
        NAME: USR$NAME,
        COLOR: USR$COLOR,
        DESCRIPTION: USR$DESCRIPTION,
        ICON: USR$ICON,
      }
    );

    await releaseTransaction();

    return label;
  } catch (error) {
    await releaseTransaction(false);
    throw new Error(error);
  }
};

const update: UpdateHandler<ILabel> = async (
  sessionID,
  id,
  metadata
) => {
  const { fetchAsSingletonObject, releaseTransaction } = await startTransaction(sessionID);

  try {
    const ID = id;

    const { USR$NAME, USR$COLOR, USR$DESCRIPTION, USR$ICON } = metadata;

    const updatedLabel = await fetchAsSingletonObject<ILabel>(
      `UPDATE USR$CRM_T_LABELS
      SET
        USR$NAME = :NAME,
        USR$COLOR = :COLOR,
        USR$DESCRIPTION = :DESCRIPTION,
        USR$ICON = :ICON
      WHERE
        ID = :ID
      RETURNING ID`,
      {
        ID: ID,
        NAME: USR$NAME,
        COLOR: USR$COLOR,
        DESCRIPTION: USR$DESCRIPTION,
        ICON: USR$ICON,
      }
    );

    await releaseTransaction();

    return updatedLabel;
  } catch (error) {
    await releaseTransaction(false);
    throw new Error(error);
  }
};

const remove: RemoveOneHandler = async (
  sessionID,
  id
) => {
  const { fetchAsSingletonObject, releaseTransaction } = await startTransaction(sessionID);

  try {
    const deletedLabel = await fetchAsSingletonObject<{ ID: number; }>(
      `DELETE FROM USR$CRM_T_LABELS WHERE ID = :id
      RETURNING ID`,
      { id }
    );

    await releaseTransaction();

    return !!deletedLabel.ID;
  } catch (error) {
    await releaseTransaction(false);
    throw new Error(error);
  }
};

export const ticketsLabelsRepository = {
  find,
  findOne,
  save,
  update,
  remove
};
