import { Attachment, Transaction } from "node-firebird-driver-native";
import { IAtField, IAtFields, IAtRelation, IAtRelationField, IAtRelationFields, IAtRelations } from "./at-types";

export const loadAtFields = async (attachment: Attachment, transaction: Transaction) => {
  const rs = await attachment.executeQuery(transaction, `
    SELECT 
      FIELDNAME,
      LNAME, 
      DESCRIPTION, 
      REFTABLE, 
      REFLISTFIELD, 
      REFCONDITION, 
      SETTABLE,
      SETLISTFIELD, 
      SETCONDITION, 
      ALIGNMENT,
      FORMAT, 
      VISIBLE, 
      COLWIDTH, 
      READONLY, 
      GDCLASSNAME, 
      GDSUBTYPE
    FROM
      AT_FIELDS`);
  try {
    return (await rs.fetchAsObject<IAtField>()).reduce( (p, r) => (p[r.FIELDNAME] = r, p), {} as IAtFields);
  } finally {
    await rs.close();
  }
};

export const loadAtRelations = async (attachment: Attachment, transaction: Transaction) => {
  const rs = await attachment.executeQuery(transaction, `
    SELECT 
      RELATIONNAME, 
      LNAME, 
      LSHORTNAME, 
      DESCRIPTION, 
      LISTFIELD, 
      EXTENDEDFIELDS, 
      SEMCATEGORY, 
      GENERATORNAME 
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
      FIELDNAME,
      RELATIONNAME, 
      FIELDSOURCE, 
      CROSSTABLE, 
      CROSSFIELD, 
      LNAME,
      LSHORTNAME, 
      DESCRIPTION, 
      VISIBLE, 
      FORMAT, 
      ALIGNMENT, 
      COLWIDTH, 
      READONLY, 
      GDCLASSNAME, 
      GDSUBTYPE, 
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

