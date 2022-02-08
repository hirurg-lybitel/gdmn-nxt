export const RDB$FIELD_TYPE = {
  SMALLINT: 7,
  INTEGER: 8,
  FLOAT: 10,
  DATE: 12,
  TIME: 13,
  CHAR: 14,
  BIGINT: 16,
  DOUBLE_PRECISION: 27,
  TIMESTAMP: 35,
  VARCHAR: 37,
  BLOB: 261
};

export const RDB$RELATION_TYPE = {
  TABLE: 0,
  VIEW: 1,
  EXTERNAL_TABLE: 2,
  MONITORING_TABLE: 3,
  CONNECTION_LEVEL_GTT: 4,
  TRANSACTION_LEVEL_GTT: 5
};

export interface IRDBField {
  RDB$FIELD_NAME: string;
  RDB$VALIDATION_SOURCE: string | null;
  RDB$COMPUTED_SOURCE: string | null;
  RDB$DEFAULT_SOURCE: string | null;
  RDB$FIELD_LENGTH: number;
  RDB$FIELD_SCALE: number;
  RDB$FIELD_TYPE: number;
  RDB$FIELD_SUB_TYPE: number | null;
  RDB$SYSTEM_FLAG: number | null;
  RDB$NULL_FLAG: number | null;
  RDB$CHARACTER_LENGTH: number | null;
  RDB$COLLATION_ID: number | null;
  RDB$CHARACTER_SET_ID: number | null;
  RDB$FIELD_PRECISION: number | null;
};

export interface IRDBFields {
  [RDB$FIELD_NAME: string]: IRDBField;
};

export interface IRDBRelation {
  RDB$RELATION_NAME: string;
  RDB$RELATION_TYPE: number;
};

export interface IRDBRelations {
  [RDB$RELATION_NAME: string]: IRDBRelation;
};

export interface IRDBRelationField {
  RDB$FIELD_NAME: string;
  RDB$RELATION_NAME: string;
  RDB$FIELD_SOURCE: string;
  RDB$DEFAULT_SOURCE: string | null;
  RDB$FIELD_POSITION: number;
  RDB$SYSTEM_FLAG: number | null;
  RDB$NULL_FLAG: number | null;
  RDB$COLLATION_ID: number | null;
};

export interface IRDBRelationFields {
  [RDB$RELATION_NAME: string]: IRDBRelationField[];
};