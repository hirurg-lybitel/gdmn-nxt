import { acquireReadTransaction, startTransaction } from '@gdmn-nxt/db-connection';
import { IContactPerson } from '@gsbelarus/util-api-types';
import { forEachAsync } from '@gsbelarus/util-helpers';

const getFIO = (value: string) => {
  const data = value.split(' ');
  return [
    data[0].slice(0, 20),
    data.length > 1 ? data[1].slice(0, 20) : '',
    data.length > 2 ? data[2].slice(0, 20) : '',
  ];
};

/**
 * Finds persons that match given find clause.
 * If persons was not found in the database - returns empty array.
 * @param sessionID Session identifier
 * @param clause The find clause object
 */
const find = async (
  sessionID: string,
  clause = {}
): Promise<IContactPerson[]> => {
  const { fetchAsObject, releaseReadTransaction, blob2String } = await acquireReadTransaction(sessionID);

  const defaultClause = {
    contacttype: 2,
    // parent: 650001
  };

  const clauseString = Object
    .keys({ ...defaultClause, ...clause })
    .map(f => ` con.${f} = :${f}`)
    .join(' AND ');

  try {
    const departmentsRaw = await fetchAsObject(`
    SELECT dep.ID, dep.NAME
    FROM GD_CONTACT con
    JOIN GD_CONTACT dep ON dep.ID = con.USR$BG_OTDEL`);

    const departments = new Map();

    departmentsRaw.forEach(res => {
      if (!departments[res['ID']]) {
        departments[res['ID']] = { ID: res['ID'], NAME: res['NAME'] };
      };
    });

    const phonesRaw = await fetchAsObject(`
      SELECT USR$CONTACTKEY, ID, USR$PHONENUMBER
      FROM USR$CRM_PHONES`);

    const phones = new Map();
    phonesRaw.forEach(res => {
      if (phones[res['USR$CONTACTKEY']]) {
        phones[res['USR$CONTACTKEY']].push({ ID: res['ID'], USR$PHONENUMBER: res['USR$PHONENUMBER'] });
      } else {
        phones[res['USR$CONTACTKEY']] = [{ ID: res['ID'], USR$PHONENUMBER: res['USR$PHONENUMBER'] }];
      };
    });

    const emailsRaw = await fetchAsObject(`
      SELECT USR$CONTACTKEY CONTACTKEY, ID, USR$EMAIL EMAIL
      FROM USR$CRM_EMAILS`);

    const emails = new Map();
    emailsRaw.forEach(res => {
      if (emails[res['CONTACTKEY']]) {
        emails[res['CONTACTKEY']].push({ ID: res['ID'], EMAIL: res['EMAIL'] });
      } else {
        emails[res['CONTACTKEY']] = [{ ID: res['ID'], EMAIL: res['EMAIL'] }];
      };
    });

    const messengersRaw = await fetchAsObject(`
      SELECT
        USR$CONTACTKEY,
        ID,
        USR$CODE CODE,
        USR$USERNAME as USERNAME
      FROM USR$CRM_MESSENGERS`);

    const messengers = new Map();
    messengersRaw.forEach(res => {
      if (messengers[res['USR$CONTACTKEY']]) {
        messengers[res['USR$CONTACTKEY']].push({ ID: res['ID'], CODE: res['CODE'], USERNAME: res['USERNAME'] });
      } else {
        messengers[res['USR$CONTACTKEY']] = [{ ID: res['ID'], CODE: res['CODE'], USERNAME: res['USERNAME'] }];
      };
    });

    const labelsRaw = await fetchAsObject(`
      SELECT
        l.ID,
        l.USR$NAME,
        l.USR$COLOR,
        l.USR$ICON,
        l.USR$DESCRIPTION,
        cl.USR$CONTACTKEY
      FROM USR$CRM_CONTACT_LABELS cl
      JOIN GD_CONTACT con ON con.ID = cl.USR$CONTACTKEY
      JOIN USR$CRM_LABELS l ON l.ID = cl.USR$LABELKEY
      ORDER BY cl.USR$CONTACTKEY`);

    const labels = new Map();
    labelsRaw.forEach(res => {
      if (labels[res['USR$CONTACTKEY']]) {
        if (!labels[res['USR$CONTACTKEY']].includes(res['ID'])) {
          labels[res['USR$CONTACTKEY']].push({ ...res });
        }
      } else {
        labels[res['USR$CONTACTKEY']] = [{ ...res }];
      };
    });

    const sql = `
      SELECT
        con.ID, con.NAME, w.NAME as RANK,
        CAST(con.NOTE AS VARCHAR(1024)) AS NOTE,
        con.ADDRESS,
        con.USR$BG_OTDEL AS BG_OTDEL,
        respondent.ID as RESP_ID,
        respondent.NAME as RESP_NAME,
        p.PHOTO AS PHOTO_BLOB,
        comp.ID AS COMP_ID,
        comp.NAME AS COMP_NAME
      FROM GD_CONTACT con
      JOIN GD_PEOPLE p ON p.CONTACTKEY = con.ID
      LEFT JOIN GD_CONTACT comp ON comp.ID = p.WCOMPANYKEY
      LEFT JOIN GD_CONTACT respondent ON respondent.ID = con.USR$CRM_RESPONDENT
      LEFT JOIN WG_POSITION w ON w.ID = p.WPOSITIONKEY
    ${clauseString.length > 0 ? `WHERE ${clauseString}` : ''}`;

    const persons = await fetchAsObject<Omit<IContactPerson, 'PHONES' | 'USR$BG_OTDEL'>>(sql, { ...defaultClause, ...clause });

    await forEachAsync(persons, async (p) => {
      if (p['RESP_ID']) {
        p.RESPONDENT = {
          ID: p['RESP_ID'],
          NAME: p['RESP_NAME'],
        };
      }
      if (p['PHOTO_BLOB'] !== null && typeof p['PHOTO_BLOB'] === 'object') {
        p.PHOTO = await blob2String(p['PHOTO_BLOB']);
      }
      if (p['COMP_ID']) {
        p.COMPANY = {
          ID: p['COMP_ID'],
          NAME: p['COMP_NAME'],
        };
      }
      delete p['COMP_ID'];
      delete p['COMP_NAME'];
      delete p['PHOTO_BLOB'];
      delete p['RESP_ID'];
      delete p['RESP_NAME'];
      p['USR$BG_OTDEL'] = departments[p['USR$BG_OTDEL']];
      p['PHONES'] = phones[p['ID']];
      p['EMAILS'] = emails[p['ID']];
      p['MESSENGERS'] = messengers[p['ID']];
      p['LABELS'] = labels[p['ID']];
    });

    return persons;
  } finally {
    releaseReadTransaction();
  }
};

/**
 * Finds first person by a given find clause.
 * If person was not found in the database - returns null.
 * @param sessionID Session identifier
 * @param clause The find clause object
 */
const findOne = async (
  sessionID: string,
  clause = {}
): Promise<IContactPerson> => {
  const persons = await find(sessionID, clause);

  if (persons.length === 0) {
    return null;
  }
  return persons[0];
};

/**
 * Updates person partially. Person can be found by a given id.
 * If person was not found in the database - returns null.
 * @param sessionID Session identifier
 * @param id Person id
 * @param metadata Partial person
 */
const update = async (
  sessionID: string,
  id: number,
  metadata: Omit<IContactPerson, 'ID'>
): Promise<IContactPerson> => {
  const { fetchAsSingletonObject, releaseTransaction, string2Blob, executeQuery } = await startTransaction(sessionID);
  try {
    const contact = await findOne(sessionID, { id });

    if (!contact) {
      await releaseTransaction(false);
      return contact;
    };

    const {
      NAME = contact.NAME,
      COMPANY = contact.COMPANY,
      USR$LETTER_OF_AUTHORITY = contact.USR$LETTER_OF_AUTHORITY,
      RANK = contact.RANK,
      PHONES = contact.PHONES,
      EMAILS = contact.EMAILS,
      MESSENGERS = contact.MESSENGERS,
      LABELS = contact.LABELS,
      RESPONDENT = contact.RESPONDENT,
      ADDRESS = contact.ADDRESS,
      NOTE = contact.NOTE,
      USR$BG_OTDEL = contact.USR$BG_OTDEL,
      PHOTO = contact.PHOTO
    } = metadata;

    await fetchAsSingletonObject<IContactPerson>(
      `UPDATE GD_CONTACT
        SET
          NAME = :NAME,
          USR$CRM_RESPONDENT = :RESPONDENT,
          ADDRESS = :ADDRESS,
          NOTE = :NOTE,
          USR$BG_OTDEL = :BG_OTDEL
        WHERE ID = :ID
        RETURNING ID`,
      {
        ID: id,
        NAME,
        RESPONDENT: RESPONDENT?.ID,
        ADDRESS,
        NOTE: await string2Blob(NOTE),
        BG_OTDEL: USR$BG_OTDEL?.ID
      }
    );

    const position = await fetchAsSingletonObject(
      `UPDATE OR INSERT INTO WG_POSITION(NAME)
      VALUES(:NAME)
      MATCHING(NAME)
      RETURNING ID, NAME`,
      { NAME: RANK }
    );

    const fio = getFIO(NAME);

    const people = await fetchAsSingletonObject(
      `UPDATE GD_PEOPLE
        SET
          CONTACTKEY = :CONTACTKEY,
          WPOSITIONKEY = :POSITIONKEY,
          USR$LETTER_OF_AUTHORITY = :LETTER_OF_AUTHORITY,
          WCOMPANYKEY = :WCOMPANYKEY,
          SURNAME = :SURNAME,
          FIRSTNAME = :FIRSTNAME,
          MIDDLENAME = :MIDDLENAME,
          PHOTO = :PHOTO
        WHERE CONTACTKEY = :CONTACTKEY
        RETURNING CONTACTKEY`,
      {
        CONTACTKEY: contact.ID,
        POSITIONKEY: position.ID,
        LETTER_OF_AUTHORITY: USR$LETTER_OF_AUTHORITY,
        WCOMPANYKEY: COMPANY?.ID,
        SURNAME: fio[0],
        FIRSTNAME: fio[1],
        MIDDLENAME: fio[2],
        PHOTO: PHOTO ? await string2Blob(PHOTO) : null
      }
    );

    const deletePhones = await executeQuery(
      'DELETE FROM USR$CRM_PHONES WHERE USR$CONTACTKEY = :CONTACTKEY',
      {
        CONTACTKEY: id
      }
    );
    deletePhones.close();

    const phonesPromises = PHONES?.map(async phone => {
      if (!phone.USR$PHONENUMBER) return;

      return fetchAsSingletonObject(
        `INSERT INTO USR$CRM_PHONES(USR$CONTACTKEY, USR$PHONENUMBER)
        VALUES(:CONTACTKEY, :PHONENUMBER)
        RETURNING ID`,
        {
          CONTACTKEY: contact.ID,
          PHONENUMBER: phone.USR$PHONENUMBER
        }
      );
    }) ?? [];

    const deleteEmails = await executeQuery(
      'DELETE FROM USR$CRM_EMAILS WHERE USR$CONTACTKEY = :CONTACTKEY',
      {
        CONTACTKEY: id
      }
    );
    deleteEmails.close();

    const emailsPromises = EMAILS?.map(async email => {
      if (!email.EMAIL) return;

      return fetchAsSingletonObject(
        `INSERT INTO USR$CRM_EMAILS(USR$CONTACTKEY, USR$EMAIL)
        VALUES(:CONTACTKEY, :EMAIL)
        RETURNING ID`,
        {
          CONTACTKEY: contact.ID,
          EMAIL: email.EMAIL
        }
      );
    }) ?? [];

    const deleteMessengers = await executeQuery(
      'DELETE FROM USR$CRM_MESSENGERS WHERE USR$CONTACTKEY = :CONTACTKEY',
      {
        CONTACTKEY: id
      }
    );
    deleteMessengers.close();

    const messengersPromises = MESSENGERS?.map(async messenger => {
      if (!messenger.CODE || !messenger.USERNAME) return;

      return fetchAsSingletonObject(
        `INSERT INTO USR$CRM_MESSENGERS(USR$CONTACTKEY, USR$CODE, USR$USERNAME)
        VALUES(:CONTACTKEY, :CODE, :USERNAME)
        RETURNING ID`,
        {
          CONTACTKEY: contact.ID,
          CODE: messenger.CODE,
          USERNAME: messenger.USERNAME
        }
      );
    }) ?? [];

    const deleteLabels = await executeQuery(
      'DELETE FROM USR$CRM_CONTACT_LABELS WHERE USR$CONTACTKEY = :CONTACTKEY',
      {
        CONTACTKEY: id
      }
    );
    deleteLabels.close();

    const labelsPromises = LABELS?.map(async label => {
      if (!label.ID) return;

      return fetchAsSingletonObject(
        `INSERT INTO USR$CRM_CONTACT_LABELS(USR$CONTACTKEY, USR$LABELKEY)
        VALUES(:CONTACTKEY, :LABELKEY)
        RETURNING ID`,
        {
          CONTACTKEY: contact.ID,
          LABELKEY: label.ID
        }
      );
    }) ?? [];


    const result = await Promise.allSettled([
      ...phonesPromises,
      ...emailsPromises,
      ...messengersPromises,
      ...labelsPromises
    ]);

    if (Array.isArray(result)) {
      const error = result.find(({ status }) => status === 'rejected');
      if (error) throw new Error(error['reason']);
    }

    await releaseTransaction();

    return {
      ...contact,
      USR$LETTER_OF_AUTHORITY: people.USR$LETTER_OF_AUTHORITY,
      RANK: position.NAME
    };
  } catch (error) {
    await releaseTransaction(false);
    throw new Error(error);
  }
};

const save = async (
  sessionID: string,
  metadata: Omit<IContactPerson, 'ID'>
): Promise<IContactPerson> => {
  const { fetchAsSingletonObject, releaseTransaction, string2Blob } = await startTransaction(sessionID);
  try {
    const {
      NAME,
      COMPANY,
      USR$LETTER_OF_AUTHORITY,
      RANK,
      PHONES,
      EMAILS,
      MESSENGERS,
      LABELS,
      RESPONDENT,
      ADDRESS,
      NOTE,
      USR$BG_OTDEL,
      PHOTO
    } = metadata;

    // insert gd_contact
    const contact = await fetchAsSingletonObject<IContactPerson>(
      `INSERT INTO GD_CONTACT(NAME, PARENT, CONTACTTYPE, USR$CRM_RESPONDENT, ADDRESS, NOTE, USR$BG_OTDEL)
      VALUES(:NAME, :PARENT, :CONTACTTYPE, :RESPONDENT, :ADDRESS, :NOTE, :BG_OTDEL)
      RETURNING ID, NAME, PARENT, CONTACTTYPE`,
      {
        NAME,
        PARENT: 650001,
        CONTACTTYPE: 2,
        RESPONDENT: RESPONDENT?.ID,
        ADDRESS,
        NOTE: await string2Blob(NOTE),
        BG_OTDEL: USR$BG_OTDEL?.ID
      }
    );

    // insert wg_position
    const position = await fetchAsSingletonObject(
      `UPDATE OR INSERT INTO WG_POSITION(NAME)
      VALUES(:NAME)
      MATCHING(NAME)
      RETURNING ID, NAME`,
      { NAME: RANK }
    );

    const fio = getFIO(NAME);

    // insert gd_people
    const people = await fetchAsSingletonObject(
      `INSERT INTO GD_PEOPLE(CONTACTKEY, WPOSITIONKEY, USR$LETTER_OF_AUTHORITY, WCOMPANYKEY, PHOTO, SURNAME, FIRSTNAME, MIDDLENAME)
      VALUES(:CONTACTKEY, :POSITIONKEY, :LETTER_OF_AUTHORITY, :WCOMPANYKEY, :PHOTO, :SURNAME, :FIRSTNAME, :MIDDLENAME)
      RETURNING CONTACTKEY, WPOSITIONKEY, USR$LETTER_OF_AUTHORITY, WCOMPANYKEY`,
      {
        CONTACTKEY: contact.ID,
        POSITIONKEY: position.ID,
        LETTER_OF_AUTHORITY: USR$LETTER_OF_AUTHORITY,
        WCOMPANYKEY: COMPANY?.ID,
        SURNAME: fio[0],
        FIRSTNAME: fio[1],
        MIDDLENAME: fio[2],
        PHOTO: await string2Blob(PHOTO)
      }
    );

    // insert gd_employee
    await fetchAsSingletonObject(
      `INSERT INTO GD_EMPLOYEE(CONTACTKEY)
      VALUES(:CONTACTKEY)
      RETURNING CONTACTKEY`,
      { CONTACTKEY: contact.ID }
    );

    // insert phones
    const phonesPromises = PHONES?.map(async phone => {
      if (!phone.USR$PHONENUMBER) return;

      return fetchAsSingletonObject(
        `INSERT INTO USR$CRM_PHONES(USR$CONTACTKEY, USR$PHONENUMBER)
        VALUES(:CONTACTKEY, :PHONENUMBER)
        RETURNING ID`,
        {
          CONTACTKEY: contact.ID,
          PHONENUMBER: phone.USR$PHONENUMBER
        }
      );
    }) ?? [];

    // insert emails
    const emailsPromises = EMAILS?.map(async email => {
      if (!email.EMAIL) return;

      return fetchAsSingletonObject(
        `INSERT INTO USR$CRM_EMAILS(USR$CONTACTKEY, USR$EMAIL)
        VALUES(:CONTACTKEY, :EMAIL)
        RETURNING ID`,
        {
          CONTACTKEY: contact.ID,
          EMAIL: email.EMAIL
        }
      );
    }) ?? [];

    // insert messengers
    const messengersPromises = MESSENGERS?.map(async messenger => {
      if (!messenger.CODE || !messenger.USERNAME) return;

      return fetchAsSingletonObject(
        `INSERT INTO USR$CRM_MESSENGERS(USR$CONTACTKEY, USR$CODE, USR$USERNAME)
        VALUES(:CONTACTKEY, :CODE, :USERNAME)
        RETURNING ID`,
        {
          CONTACTKEY: contact.ID,
          CODE: messenger.CODE,
          USERNAME: messenger.USERNAME
        }
      );
    }) ?? [];

    // insert lables
    const labelsPromises = LABELS?.map(async label => {
      if (!label.ID) return;

      return fetchAsSingletonObject(
        `INSERT INTO USR$CRM_CONTACT_LABELS(USR$CONTACTKEY, USR$LABELKEY)
        VALUES(:CONTACTKEY, :LABELKEY)
        RETURNING ID`,
        {
          CONTACTKEY: contact.ID,
          LABELKEY: label.ID
        }
      );
    }) ?? [];

    const result = await Promise.allSettled([
      ...phonesPromises,
      ...emailsPromises,
      ...messengersPromises,
      ...labelsPromises
    ]);

    if (Array.isArray(result)) {
      const error = result.find(({ status }) => status === 'rejected');
      if (error) throw new Error(error['reason']);
    }

    await releaseTransaction();

    return {
      ...contact,
      USR$LETTER_OF_AUTHORITY: people.USR$LETTER_OF_AUTHORITY,
      RANK: position.NAME
    };
  } catch (error) {
    await releaseTransaction(false);
    throw new Error(error);
  }
};

const remove = async (
  sessionID: string,
  id: number
): Promise<{ID: number}> => {
  const { fetchAsSingletonObject, releaseTransaction } = await startTransaction(sessionID);

  try {
    const deletedPerson = await fetchAsSingletonObject<{ID: number}>(
      `DELETE FROM GD_CONTACT WHERE ID = :id
      RETURNING ID`,
      { id }
    );

    await releaseTransaction();

    return deletedPerson;
  } catch (error) {
    await releaseTransaction(false);
    throw new Error(error);
  }
};


export const contactPersonsRepository = {
  find,
  findOne,
  update,
  save,
  remove
};
