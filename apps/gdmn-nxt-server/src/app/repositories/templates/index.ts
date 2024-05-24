import { acquireReadTransaction, startTransaction } from '@gdmn-nxt/db-connection';
import { FindHandler, FindOneHandler, ITemplate, RemoveHandler, SaveHandler, UpdateHandler } from '@gsbelarus/util-api-types';
import { forEachAsync } from '@gsbelarus/util-helpers';

const find: FindHandler<ITemplate> = async (sessionID, clause = {}) => {
  const { fetchAsObject, releaseReadTransaction, blob2String } = await acquireReadTransaction(sessionID);

  try {
    const clauseString = Object
      .keys({ ...clause })
      .map(f => ` s.${f} = :${f}`)
      .join(' AND ');

    const templates = await fetchAsObject<ITemplate>(
      `SELECT
        s.ID,
        USR$NAME NAME,
        USR$HTML HTML_BLOB
      FROM
        USR$CRM_MARKETING_TEMPLATES s
      ${clauseString.length > 0 ? ` WHERE ${clauseString}` : ''}`,
      { ...clause });

    await forEachAsync(templates, async t => {
      t.HTML = await blob2String(t['HTML_BLOB']);
      delete t['HTML_BLOB'];
    });

    return templates;
  } finally {
    releaseReadTransaction();
  }
};

const findOne: FindOneHandler<ITemplate> = async (sessionID, clause = {}) => {
  const templates = await find(sessionID, clause);

  if (templates.length === 0) {
    return Promise.resolve(undefined);
  }

  return templates[0];
};

const update: UpdateHandler<ITemplate> = async (
  sessionID,
  id,
  metadata
) => {
  const { fetchAsSingletonObject, string2Blob, releaseTransaction } = await startTransaction(sessionID);

  try {
    const template = await findOne(sessionID, { id });

    const ID = id;

    const {
      NAME = template.NAME,
      HTML = template.HTML
    } = metadata;

    const updatedTemplate = await fetchAsSingletonObject<ITemplate>(
      `UPDATE USR$CRM_MARKETING_TEMPLATES
      SET
        USR$NAME = :NAME,
        USR$HTML = :HTML
      WHERE
        ID = :ID
      RETURNING ID`,
      {
        ID,
        NAME,
        HTML: await string2Blob(HTML)
      }
    );
    await releaseTransaction();

    return updatedTemplate;
  } catch (error) {
    await releaseTransaction(false);
    throw new Error(error);
  }
};

const save: SaveHandler<ITemplate> = async (
  sessionID,
  metadata
) => {
  const { fetchAsSingletonObject, releaseTransaction, string2Blob } = await startTransaction(sessionID);

  const {
    NAME,
    HTML,
  } = metadata;

  try {
    const template = await fetchAsSingletonObject<ITemplate>(
      `INSERT INTO USR$CRM_MARKETING_TEMPLATES(USR$NAME, USR$HTML)
      VALUES(:NAME, :HTML)
      RETURNING ID`,
      {
        NAME,
        HTML: await string2Blob(HTML)
      }
    );

    await releaseTransaction();

    return template;
  } catch (error) {
    await releaseTransaction(false);
    throw new Error(error);
  }
};

const remove: RemoveHandler = async (
  sessionID,
  id
) => {
  const { fetchAsSingletonObject, releaseTransaction } = await startTransaction(sessionID);

  try {
    const deletedTemplate = await fetchAsSingletonObject<{ID: number}>(
      `DELETE FROM USR$CRM_MARKETING_TEMPLATES WHERE ID = :id
      RETURNING ID`,
      { id }
    );

    await releaseTransaction();

    return !!deletedTemplate.ID;
  } catch (error) {
    await releaseTransaction(false);
    throw new Error(error);
  }
};

export const templatesRepository = {
  find,
  findOne,
  update,
  save,
  remove
};
