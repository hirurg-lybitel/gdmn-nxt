/* eslint-disable camelcase */
import { startTransaction } from '@gdmn-nxt/db-connection';
import { ICustomer, ICustomerTickets, RemoveOneHandler, SaveHandler, UpdateHandler } from '@gsbelarus/util-api-types';

const save: SaveHandler<ICustomer> = async (
  sessionID,
  metadata
) => {
  const { executeSingletonAsObject, releaseTransaction } = await startTransaction(sessionID);

  const {
    NAME, PHONE, EMAIL, ADDRESS, TAXID
  } = metadata;

  try {
    const newCustomer = await executeSingletonAsObject(
      `EXECUTE BLOCK(
          in_NAME  TYPE OF COLUMN GD_CONTACT.NAME = ?,
          in_EMAIL TYPE OF COLUMN GD_CONTACT.EMAIL = ?,
          in_PHONE TYPE OF COLUMN GD_CONTACT.PHONE = ?,
          in_ADDRESS TYPE OF COLUMN GD_CONTACT.ADDRESS = ?,
          in_TAXID TYPE OF COLUMN GD_COMPANYCODE.TAXID = ?
        )
        RETURNS(
          ID    INTEGER,
          NAME  TYPE OF COLUMN GD_CONTACT.NAME,
          EMAIL TYPE OF COLUMN GD_CONTACT.EMAIL,
          PHONE TYPE OF COLUMN GD_CONTACT.PHONE,
          ADDRESS TYPE OF COLUMN GD_CONTACT.ADDRESS,
          AXID TYPE OF COLUMN GD_COMPANYCODE.TAXID
        )
        AS
        BEGIN
          INSERT INTO GD_CONTACT(CONTACTTYPE, PARENT, NAME, PHONE, EMAIL, ADDRESS)
          VALUES(3, (SELECT ID FROM GD_RUID WHERE XID = 147002208 AND DBID = 31587988 ROWS 1), :in_NAME, :in_PHONE, :in_EMAIL, :in_ADDRESS)
          RETURNING ID, NAME, PHONE, EMAIL, ADDRESS
          INTO :ID, :NAME, :PHONE, :EMAIL, :ADDRESS;

          IF (ID IS NOT NULL) THEN
            UPDATE OR INSERT INTO GD_COMPANY(CONTACTKEY)
            VALUES(:ID)
            MATCHING(CONTACTKEY);
          IF (ID IS NOT NULL) THEN
            UPDATE OR INSERT INTO GD_COMPANYCODE(COMPANYKEY, TAXID)
            VALUES(:ID, :in_TAXID)
            MATCHING(COMPANYKEY)
            RETURNING TAXID
            INTO :in_TAXID;
          SUSPEND;
        END`,
      [NAME, EMAIL, PHONE, ADDRESS, TAXID]
    );

    await releaseTransaction();

    return newCustomer;
  } catch (error) {
    await releaseTransaction(false);
    throw new Error(error);
  }
};

const remove: RemoveOneHandler = async (
  sessionID,
  id
) => {
  const { executeQuery, releaseTransaction } = await startTransaction(sessionID);

  try {
    await executeQuery(
      `EXECUTE BLOCK(
        ID INTEGER = ?
      )
      AS
      BEGIN
        DELETE FROM GD_COMPANYCODE WHERE COMPANYKEY = :ID;
        DELETE FROM GD_COMPANY WHERE CONTACTKEY = :ID;
        DELETE FROM GD_CONTACT WHERE ID = :ID;
      END`,
      [id]
    );

    await releaseTransaction();

    return true;
  } catch (error) {
    await releaseTransaction(false);
    throw new Error(error);
  }
};

const update: UpdateHandler<ICustomer> = async (
  sessionID,
  id,
  metadata
) => {
  const { executeSingletonAsObject, releaseTransaction } = await startTransaction(sessionID);

  const {
    NAME, PHONE, EMAIL, ADDRESS, TAXID
  } = metadata;

  try {
    const newCustomer = await executeSingletonAsObject(
      `EXECUTE BLOCK(
          in_ID  TYPE OF COLUMN GD_CONTACT.ID = ?,
          in_NAME  TYPE OF COLUMN GD_CONTACT.NAME = ?,
          in_EMAIL TYPE OF COLUMN GD_CONTACT.EMAIL = ?,
          in_PHONE TYPE OF COLUMN GD_CONTACT.PHONE = ?,
          in_ADDRESS TYPE OF COLUMN GD_CONTACT.ADDRESS = ?,
          in_TAXID TYPE OF COLUMN GD_COMPANYCODE.TAXID = ?
        )
        RETURNS(
          ID    INTEGER,
          NAME  TYPE OF COLUMN GD_CONTACT.NAME,
          EMAIL TYPE OF COLUMN GD_CONTACT.EMAIL,
          PHONE TYPE OF COLUMN GD_CONTACT.PHONE,
          ADDRESS TYPE OF COLUMN GD_CONTACT.ADDRESS,
          AXID TYPE OF COLUMN GD_COMPANYCODE.TAXID
        )
        AS
        BEGIN
          UPDATE OR INSERT INTO GD_CONTACT(ID, CONTACTTYPE, PARENT, NAME, PHONE, EMAIL, ADDRESS)
          VALUES(:in_ID, 3, (SELECT ID FROM GD_RUID WHERE XID = 147002208 AND DBID = 31587988 ROWS 1), :in_NAME, :in_PHONE, :in_EMAIL, :in_ADDRESS)
          MATCHING(ID)
          RETURNING ID, NAME, PHONE, EMAIL, ADDRESS
          INTO :ID, :NAME, :PHONE, :EMAIL, :ADDRESS;

          IF (ID IS NOT NULL) THEN
            UPDATE OR INSERT INTO GD_COMPANY(CONTACTKEY)
            VALUES(:ID)
            MATCHING(CONTACTKEY);
          IF (ID IS NOT NULL) THEN
            UPDATE OR INSERT INTO GD_COMPANYCODE(COMPANYKEY, TAXID)
            VALUES(:ID, :in_TAXID)
            MATCHING(COMPANYKEY)
            RETURNING TAXID
            INTO :in_TAXID;
          SUSPEND;
        END`,
      [id, NAME, EMAIL, PHONE, ADDRESS, TAXID]
    );

    await releaseTransaction();

    return newCustomer;
  } catch (error) {
    await releaseTransaction(false);
    throw new Error(error);
  }
};

const addToTickets: UpdateHandler<ICustomerTickets> = async (
  sessionID,
  id,
  metadata
) => {
  const { fetchAsSingletonObject, releaseTransaction } = await startTransaction(sessionID);

  const { performer } = metadata;

  try {
    const updatedCustomer = await fetchAsSingletonObject<ICustomerTickets>(
      `UPDATE GD_COMPANY
        SET
          USR$CRM_TICKETSYSTEM = :TICKETSYSTEM,
          USR$CRM_PERFORMER = :PERFORMER
        WHERE CONTACTKEY = :ID
        RETURNING CONTACTKEY
      `,
      {
        TICKETSYSTEM: true,
        PERFORMER: performer?.ID,
        ID: id
      }
    );

    updatedCustomer['ID'] = updatedCustomer['CONTACTKEY'];
    delete updatedCustomer['CONTACTKEY'];

    await releaseTransaction(true);

    return updatedCustomer;
  } catch (error) {
    await releaseTransaction(false);
    throw new Error(error);
  }
};

const updateTickets: UpdateHandler<ICustomer> = async (
  sessionID,
  id,
  metadata
) => {
  const { fetchAsSingletonObject, releaseTransaction } = await startTransaction(sessionID);

  const { performer } = metadata;

  try {
    const updatedCustomer = await fetchAsSingletonObject<ICustomer>(
      `UPDATE GD_COMPANY
        SET
          USR$CRM_PERFORMER = :PERFORMER
        WHERE CONTACTKEY = :ID
        RETURNING CONTACTKEY
      `,
      {
        PERFORMER: performer?.ID,
        ID: id
      }
    );

    updatedCustomer['ID'] = updatedCustomer['CONTACTKEY'];
    delete updatedCustomer['CONTACTKEY'];

    await releaseTransaction(true);

    return updatedCustomer;
  } catch (error) {
    await releaseTransaction(false);
    throw new Error(error);
  }
};

export const customerRepository = {
  save,
  remove,
  update,
  addToTickets,
  updateTickets
};
