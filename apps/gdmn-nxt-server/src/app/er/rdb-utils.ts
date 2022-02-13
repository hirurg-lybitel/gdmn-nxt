import { Attachment, Transaction } from "node-firebird-driver-native";
import { IRDBField, IRDBFields, IRDBRelation, IRDBRelationField, IRDBRelationFields, IRDBRelations } from "./rdb-types";

export const loadRDBFields = async (attachment: Attachment, transaction: Transaction) => {
  const rs = await attachment.executeQuery(transaction, `
    SELECT 
      TRIM(rdb$field_name) AS rdb$field_name,
      CAST(rdb$validation_source AS VARCHAR(1024)) AS rdb$validation_source,
      CAST(rdb$computed_source AS VARCHAR(1024)) AS rdb$computed_source, 
      CAST(rdb$default_source AS VARCHAR(1024)) AS rdb$default_source, 
      rdb$field_length,
      rdb$field_scale,
      rdb$field_type,
      rdb$field_sub_type,
      rdb$system_flag,
      rdb$null_flag,
      rdb$character_length,
      rdb$collation_id,
      rdb$character_set_id,
      rdb$field_precision
    FROM 
      rdb$fields
  `);
  try {
    const res = await rs.fetchAsObject<IRDBField>();
    return res.reduce( (p, r) => (p[r.RDB$FIELD_NAME] = r, p), {} as IRDBFields);
  } finally {
    await rs.close();
  }
};

export const loadRDBRelations = async (attachment: Attachment, transaction: Transaction) => {
  const rs = await attachment.executeQuery(transaction, `
    SELECT 
      TRIM(rdb$relation_name) AS rdb$relation_name,
      rdb$relation_type
    FROM 
      rdb$relations
  `);
  try {
    return (await rs.fetchAsObject<IRDBRelation>()).reduce( (p, r) => (p[r.RDB$RELATION_NAME] = r, p), {} as IRDBRelations);
  } finally {
    await rs.close();
  }
};

export const loadRDBRelationFields = async (attachment: Attachment, transaction: Transaction) => {
  const rs = await attachment.executeQuery(transaction, `
    SELECT
      TRIM(RDB$FIELD_NAME) AS rdb$field_name,
      TRIM(RDB$RELATION_NAME) AS rdb$relation_name,
      TRIM(RDB$FIELD_SOURCE) AS rdb$field_source,
      RDB$DEFAULT_SOURCE,
      RDB$FIELD_POSITION,
      RDB$SYSTEM_FLAG,
      RDB$NULL_FLAG,
      RDB$COLLATION_ID
    FROM
      rdb$relation_fields
    ORDER BY
      rdb$relation_name, rdb$field_position
  `);
  try {
    return (await rs.fetchAsObject<IRDBRelationField>()).reduce( (p, r) => {
      if (!p[r.RDB$RELATION_NAME]) {
        p[r.RDB$RELATION_NAME] = [r];
      } else {
        p[r.RDB$RELATION_NAME].push(r);
      }
      return p;
    }, {} as IRDBRelationFields);
  } finally {
    await rs.close();
  }
};



