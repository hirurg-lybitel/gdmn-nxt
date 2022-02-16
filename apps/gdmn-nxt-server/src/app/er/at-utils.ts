import { Attachment, Transaction } from "node-firebird-driver-native";
import { IAtField, IAtFields, IAtRelation, IAtRelationField, IAtRelationFields, IAtRelations, IGedeminDocType } from "./at-types";

export const loadAtFields = async (attachment: Attachment, transaction: Transaction) => {
  const rs = await attachment.executeQuery(transaction, `
    SELECT 
      TRIM(FIELDNAME) AS FIELDNAME,
      LNAME, 
      DESCRIPTION, 
      TRIM(REFTABLE) AS REFTABLE, 
      TRIM(REFLISTFIELD) AS REFLISTFIELD, 
      TRIM(REFCONDITION) AS REFCONDITION, 
      TRIM(SETTABLE) AS SETTABLE,
      TRIM(SETLISTFIELD) AS SETLISTFIELD, 
      TRIM(SETCONDITION) AS SETCONDITION, 
      ALIGNMENT,
      FORMAT, 
      VISIBLE, 
      COLWIDTH, 
      READONLY, 
      TRIM(GDCLASSNAME) AS GDCLASSNAME, 
      TRIM(GDSUBTYPE) AS GDSUBTYPE,
      NUMERATION
    FROM
      AT_FIELDS`);
  try {
    //TODO: преобразовывать нумерацию из блоба!
    return (await rs.fetchAsObject<IAtField>()).reduce( (p, r) => (p[r.FIELDNAME] = r, p), {} as IAtFields);
  } finally {
    await rs.close();
  }
};

export const loadAtRelations = async (attachment: Attachment, transaction: Transaction) => {
  const rs = await attachment.executeQuery(transaction, `
    SELECT 
      TRIM(RELATIONNAME) AS RELATIONNAME, 
      LNAME, 
      LSHORTNAME, 
      DESCRIPTION, 
      TRIM(LISTFIELD) AS LISTFIELD, 
      TRIM(EXTENDEDFIELDS) AS EXTENDEDFIELDS, 
      SEMCATEGORY, 
      TRIM(GENERATORNAME) AS GENERATORNAME 
    FROM 
      AT_RELATIONS `);
  try {
    return (await rs.fetchAsObject<IAtRelation>()).reduce( (p, r) => (p[r.RELATIONNAME] = r, p), {} as IAtRelations);
  } finally {
    await rs.close();
  }
};

export const loadAtRelationFields = async (attachment: Attachment, transaction: Transaction) => {
  const rs = await attachment.executeQuery(transaction, `
    SELECT 
      TRIM(FIELDNAME) AS FIELDNAME,
      TRIM(RELATIONNAME) AS RELATIONNAME, 
      TRIM(FIELDSOURCE) AS FIELDSOURCE, 
      TRIM(CROSSTABLE) AS CROSSTABLE, 
      TRIM(CROSSFIELD) AS CROSSFIELD, 
      LNAME,
      LSHORTNAME, 
      DESCRIPTION, 
      VISIBLE, 
      FORMAT, 
      ALIGNMENT, 
      COLWIDTH, 
      READONLY, 
      TRIM(GDCLASSNAME) AS GDCLASSNAME, 
      TRIM(GDSUBTYPE) AS GDSUBTYPE, 
      DELETERULE,
      SEMCATEGORY
    FROM
      AT_RELATION_FIELDS 
  `);
  try {
    return (await rs.fetchAsObject<IAtRelationField>()).reduce( (p, r) => {
      if (!p[r.RELATIONNAME]) {
        p[r.RELATIONNAME] = [r];
      } else {
        p[r.RELATIONNAME].push(r);
      }
      return p;
    }, {} as IAtRelationFields);
  } finally {
    await rs.close();
  }
};

export const loadDocumentTypes = async (attachment: Attachment, transaction: Transaction) => {
  const rs = await attachment.executeQuery(transaction, `
    SELECT 
      DT.ID,
      DT.PARENT,
      DT.LB,
      DT.RB,
      DT.NAME,
      DT.DESCRIPTION,
      DT.CLASSNAME,
      DT.DOCUMENTTYPE,
      DT.RUID,
      HR.RELATIONNAME AS HEADERRELNAME,
      LR.RELATIONNAME AS LINERELNAME
    FROM
      GD_DOCUMENTTYPE DT
      LEFT JOIN AT_RELATIONS HR ON HR.ID = DT.HEADERRELKEY
      LEFT JOIN AT_RELATIONS LR ON LR.ID = DT.LINERELKEY
    WHERE
      DT.ID >= 147000000  
    ORDER BY
      DT.LB
  `);
  try {
    return (await rs.fetchAsObject<IGedeminDocType>());
  } finally {
    await rs.close();
  }
};

