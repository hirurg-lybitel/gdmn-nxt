export interface IAttrBase {
  name: string;
};

export interface IStringAttr extends IAttrBase {
  type: 'STRING',
  maxLen: number;
  default?: string;
};

export interface INumAttrBase extends IAttrBase {
  max: number;
  min: number;
  default?: number;
};

export interface IIntegerAttr extends INumAttrBase {
  type: 'INTEGER'
};

export interface IDoubleAttr extends INumAttrBase {
  type: 'DOUBLE'
};

export type Attr = IStringAttr | IIntegerAttr | IDoubleAttr;

export type Entity = IEntity;

export interface IEntity {
  parent?: string;
  name: string;
  abstract?: boolean;
  attributes: Attr[];
  adapter?: IEntityAdapter;
};

export interface IEntities {
  [name: string]: Entity;
};

export interface IERModel {
  entities: IEntities;
};

export interface IOperandField {
  type: 'FIELD';
  alias: string;
  fieldName: string;
};

export interface IOperandList {
  type: 'LIST';
  values: (number | string)[];
};

export interface IOperandValue {
  type: 'VALUE';
  value: number | string;
};

export interface IOperandQuery {
  type: 'QUERY';
  query: string;
};

export type Operand = IOperandField | IOperandList | IOperandValue | IOperandQuery;

export interface IConditionIn {
  operator: 'IN';
  left: Operand;
  right: Operand;
};

export interface IConditionNotIn {
  operator: 'NOT IN';
  left: Operand;
  right: Operand;
};

export interface IConditionEq {
  operator: 'EQ';
  left: Operand;
  right: Operand;
};

export interface IConditionExists {
  operator: 'EXISTS';
  query: string;
};

export interface IConditionAnd {
  operator: 'AND';
  left: Condition;
  right: Condition;
};

export type Condition = IConditionIn 
  | IConditionNotIn 
  | IConditionEq 
  | IConditionExists 
  | IConditionAnd;

export interface IRelation {
  name: string;
  alias: string;
  join?: {
    type: 'INNER' | 'LEFT';
    relation: IRelation;
    condition?: Condition;
  }
  condition?: Condition;
};

export interface IEntityAdapter {
  relation: IRelation,
};