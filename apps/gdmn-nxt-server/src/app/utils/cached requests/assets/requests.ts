import { contactPersonsRepository } from '@gdmn-nxt/repositories/contacts/contactPersons';

export const requests = {
  customers: `
    SELECT DISTINCT
      c.ID,
      c.NAME,
      c.PHONE,
      c.EMAIL,
      comp.TAXID,
      c.ADDRESS,
      com.FULLNAME,
      c.FAX,
      c.USR$CRM_POSTADDRESS AS POSTADDRESS
    FROM
      gd_contact c
      join gd_companycode comp on comp.COMPANYKEY = c.id
      JOIN GD_COMPANY com ON com.CONTACTKEY = c.ID
    ORDER BY c.NAME`,
  customerLabels: `
    SELECT
      l.ID,
      l.USR$NAME,
      l.USR$COLOR,
      l.USR$ICON,
      l.USR$DESCRIPTION,
      cl.USR$CONTACTKEY
    FROM USR$CRM_CUSTOMER_LABELS cl
    JOIN GD_CONTACT con ON con.ID = cl.USR$CONTACTKEY
    JOIN USR$CRM_LABELS l ON l.ID = cl.USR$LABELKEY
    ORDER BY cl.USR$CONTACTKEY`,
  businessProcesses: `
    SELECT
      c.USR$GD_CONTACTKEY AS CONTACTKEY,
      c.USR$BG_BISNESS_PROCKEY AS PROCKEY,
      b.ID, b.USR$NAME AS NAME
    FROM USR$CROSS1242_1980093301 c
    JOIN USR$BG_BISNESS_PROC b ON b.ID = c.USR$BG_BISNESS_PROCKEY
    ORDER BY c.USR$GD_CONTACTKEY`,
  customerInfo: `
    SELECT
      cust.USR$CUSTOMERKEY,
      cust.USR$JOBKEY,
      cust.USR$DEPOTKEY,
      cust.USR$JOBWORKKEY
    FROM USR$CRM_CUSTOMER cust
    ORDER BY cust.USR$CUSTOMERKEY`,
  customerPersons: contactPersonsRepository.find,
  phones: `
    SELECT
      p.ID, p.USR$CONTACTKEY, p.USR$PHONENUMBER
    FROM USR$CRM_PHONES p
    ORDER BY p.USR$CONTACTKEY`,
  emails: `
    SELECT
      e.ID, e.USR$CONTACTKEY, e.USR$EMAIL
    FROM USR$CRM_EMAILS e
    ORDER BY e.USR$CONTACTKEY`,
  messengers: `
    SELECT
      m.ID, m.USR$CONTACTKEY, m.USR$CODE CODE, m.USR$USERNAME USERNAME
    FROM USR$CRM_MESSENGERS m
    ORDER BY m.USR$CONTACTKEY`,
  contactLabels: `
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
    ORDER BY cl.USR$CONTACTKEY`,
};
