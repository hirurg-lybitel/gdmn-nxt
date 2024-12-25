import { acquireReadTransaction, startTransaction } from '@gdmn-nxt/db-connection';
import { IProjectNote } from '@gsbelarus/util-api-types';

const find = async (sessionID: string): Promise<{ [key: string]: IProjectNote[]}> => {
  const {
    fetchAsObject,
    releaseReadTransaction,
  } = await acquireReadTransaction(sessionID);

  try {
    const notes: {
    [key: string]: any;
  } = {};

    const rawNotes = await fetchAsObject(
      `SELECT
        ID,
        USR$NOTE,
        USR$PROJECT
      FROM USR$CRM_TT_PROJECTS_NOTES
      `);

    rawNotes.forEach(el => {
      const note = {
        ID: el['ID'],
        message: el['USR$NOTE']
      };
      if (notes[el['USR$PROJECT']]) {
        notes[el['USR$PROJECT']].push(note);
      } else {
        notes[el['USR$PROJECT']] = [note];
      };
    });

    return notes;
  } finally {
    releaseReadTransaction();
  }
};

const save = async(sessionID: string, note: IProjectNote, projectId: number) => {
  const {
    fetchAsSingletonObject,
    releaseTransaction,
  } = await startTransaction(sessionID);
  try {
    const newNote = await fetchAsSingletonObject<IProjectNote>(
      `INSERT INTO USR$CRM_TT_PROJECTS_NOTES(USR$PROJECT, USR$NOTE)
      VALUES(:project, :note)
      RETURNING ID`,
      {
        project: projectId,
        note: note.message
      }
    );
    return newNote;
  } finally {
    releaseTransaction();
  }
};

const remove = async (sessionID: string, id: number) => {
  const {
    fetchAsSingletonObject,
    releaseTransaction,
  } = await startTransaction(sessionID);
  try {
    const deletedNote = await fetchAsSingletonObject<{ID: number}>(
      `DELETE FROM USR$CRM_TT_PROJECTS_NOTES WHERE ID = :id
      RETURNING ID`,
      { id }
    );
    return deletedNote;
  } finally {
    releaseTransaction();
  }
};

export const projectNotesRepository = {
  find,
  save,
  remove
};
