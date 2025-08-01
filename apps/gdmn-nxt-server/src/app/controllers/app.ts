import { ColorMode, TicketsUser, GedeminUser, IAccount, IAuthResult, IWithID, UserType } from '@gsbelarus/util-api-types';
import { getReadTransaction, releaseReadTransaction } from '@gdmn-nxt/db-connection';
import { compare } from 'bcryptjs';

export const checkGedeminUser = async (userName: string, password: string): Promise<IAuthResult> => {
  const query = `
    SELECT
      u.ID,
      u.passw,
      u.ingroup,
      u.disabled as userDisabled,
      c.name as contactName,
      c.disabled as contactDisabled,
      c.email,
      p.firstname,
      p.surname
    FROM
      gd_user u
      JOIN gd_contact c ON c.id = u.contactkey
      JOIN gd_people p ON p.contactkey = c.id
    WHERE UPPER(u.name) = ?
  `;

  const { attachment, transaction } = await getReadTransaction('passport');
  try {
    const rs = await attachment.executeQuery(transaction, query, [userName.toLocaleUpperCase()]);
    try {
      const data = await rs.fetchAsObject();

      if (data.length === 1) {
        if (data[0]['PASSW'] !== password) {
          return {
            result: 'INVALID_PASSWORD'
          };
        }

        if (data[0]['USERDISABLED'] || data[0]['CONTACTDISABLED']) {
          return {
            result: 'ACCESS_DENIED'
          };
        }

        return {
          result: 'SUCCESS',
          userProfile: {
            id: data[0]['ID'],
            userName,
            email: data[0]['EMAIL'],
            firstname: data[0]['FIRSTNAME'],
            surname: data[0]['SURNAME'],
            type: UserType.Gedemin
          }
        };
      } else if (!data.length) {
        return {
          result: 'UNKNOWN_USER'
        };
      } else {
        throw new Error('Data corrupted.');
      }
    } finally {
      await rs.close();
    }
  } finally {
    await releaseReadTransaction('passport');
  }
};

export const checkTicketsUser = async (userName: string, password: string): Promise<IAuthResult> => {
  const query = `
    SELECT
      ID,
      USR$USERNAME,
      USR$PASSWORD,
      USR$EMAIL,
      DISABLED,
      USR$COMPANYKEY,
      USR$ONE_TIME_PASSWORD,
      USR$ISADMIN
    FROM USR$CRM_USER
    WHERE UPPER(USR$USERNAME) = ?
  `;

  const { attachment, transaction } = await getReadTransaction('passport');
  try {
    const rs = await attachment.executeQuery(transaction, query, [userName.toLocaleUpperCase()]);
    try {
      const data = await rs.fetchAsObject();

      if (data.length === 1) {
        if (data[0]['DISABLED'] === 1) {
          return {
            result: 'ACCESS_DENIED'
          };
        }

        const validPassword = data[0]['USR$ONE_TIME_PASSWORD'] === 1
          ? data[0]['USR$PASSWORD'] === password
          : await compare(password, data[0]['USR$PASSWORD'] ?? '');

        if (!validPassword) {
          return {
            result: 'INVALID_PASSWORD'
          };
        }

        return {
          result: 'SUCCESS',
          userProfile: {
            id: data[0]['ID'],
            userName: data[0]['USR$USERNAME'],
            email: data[0]['USR$EMAIL'],
            type: UserType.Tickets,
            companyKey: data[0]['USR$COMPANYKEY'],
            isAdmin: data[0]['USR$ISADMIN'] === 1
          }
        };
      } else if (!data.length) {
        return {
          result: 'UNKNOWN_USER'
        };
      } else {
        throw new Error('Data corrupted.');
      }
    } finally {
      await rs.close();
    }
  } finally {
    await releaseReadTransaction('passport');
  }
};

export const getGedeminUser = async (userName: string): Promise<GedeminUser | undefined> => {
  const query = `
    SELECT
      u.id,
      u.name,
      u.contactkey,
      w.NAME as RANK,
      ps.USR$MODE as ColorMode,
      ps.USR$SAVEFILTERS as SAVEFILTERS,
      c.NAME as FullName
    FROM
      gd_user u
      JOIN gd_contact c ON c.id = u.contactkey
      JOIN gd_people p ON p.contactkey = c.id
      LEFT JOIN USR$CRM_PROFILE_SETTINGS ps ON ps.USR$USERKEY = u.ID
      LEFT JOIN WG_POSITION w ON w.ID = p.WPOSITIONKEY
    WHERE UPPER(u.name) = ?
  `;

  const { attachment, transaction } = await getReadTransaction('passport');
  try {
    const rs = await attachment.executeQuery(transaction, query, [userName.toLocaleUpperCase()]);
    try {
      const data = await rs.fetchAsObject();

      if (data.length === 1) {
        return {
          id: data[0]['ID'],
          userName,
          contactkey: data[0]['CONTACTKEY'],
          rank: data[0]['RANK'],
          colorMode: data[0]['COLORMODE'] ?? ColorMode.Dark,
          fullName: data[0]['FULLNAME'],
          saveFilters: data[0]['SAVEFILTERS'] === 1
        };
      } else if (!data.length) {
        return undefined;
      } else {
        throw new Error('Data corrupted.');
      }
    } finally {
      await rs.close();
    }
  } finally {
    await releaseReadTransaction('passport');
  }
};

export const getTicketsUser = async (userName: string): Promise<TicketsUser | undefined> => {
  const query = `
    SELECT
      u.ID,
      ps.USR$MODE as ColorMode,
      u.USR$FULLNAME as FULLNAME,
      ps.USR$SAVEFILTERS as SAVEFILTERS
    FROM USR$CRM_USER u
      LEFT JOIN USR$CRM_T_USER_PROFILE_SETTINGS ps ON ps.USR$USERKEY = u.ID
    WHERE UPPER(u.USR$USERNAME) = ?
  `;

  const { attachment, transaction } = await getReadTransaction('passport');
  try {
    const rs = await attachment.executeQuery(transaction, query, [userName.toLocaleUpperCase()]);
    try {
      const data = await rs.fetchAsObject();

      if (data.length === 1) {
        return {
          id: data[0]['ID'],
          userName,
          rank: null,
          colorMode: data[0]['COLORMODE'] ?? ColorMode.Dark,
          fullName: data[0]['FULLNAME'],
          saveFilters: data[0]['SAVEFILTERS'] === 1
        };
      } else if (!data.length) {
        return undefined;
      } else {
        throw new Error('Data corrupted.');
      }
    } finally {
      await rs.close();
    }
  } finally {
    await releaseReadTransaction('passport');
  }
};

export const getAccount = async (sessionId: string, email: string): Promise<(IAccount & IWithID) | undefined> => {
  console.log('getAccount...');

  const query = `
    SELECT
      acc.*
    FROM
      usr$crm_account acc
    WHERE UPPER(acc.usr$email) = ?
  `;
  const { attachment, transaction } = await getReadTransaction(sessionId);

  try {
    const rs = await attachment.executeQuery(transaction, query, [email.toLocaleUpperCase()]);
    try {
      const data = await rs.fetchAsObject<IAccount & IWithID>();

      if (data.length === 1) {
        return data[0];
      } else if (!data.length) {
        return undefined;
      } else {
        throw new Error('More than one account with the same email.');
      }
    } finally {
      await rs.close();
    }
  } finally {
    await releaseReadTransaction(sessionId);
  }
};
