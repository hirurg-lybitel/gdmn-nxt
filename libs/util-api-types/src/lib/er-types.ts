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

export interface IExpressionIn {
  operator: 'IN';
  left: Operand;
  right: Operand;
};

export interface IExpressionNotIn {
  operator: 'NOT IN';
  left: Operand;
  right: Operand;
};

export interface IExpressionEq {
  operator: 'EQ';
  left: Operand;
  right: Operand;
};

export interface IExpressionLike {
  operator: 'LIKE';
  left: Operand;
  right: Operand;
};

export interface IExpressionIsNull {
  operator: 'IS NULL';
  left: Expression;
};

export interface IExpressionIsNotNull {
  operator: 'IS NOT NULL';
  left: Operand;
};

export interface IExpressionExists {
  operator: 'EXISTS';
  query: string;
};

export interface IExpressionAnd {
  operator: 'AND';
  left: Expression;
  right: Expression;
};

export interface IExpressionPlus {
  operator: '+';
  left: Operand;
  right: Operand;
};

export type Expression = Operand
  | IExpressionIn 
  | IExpressionNotIn 
  | IExpressionEq 
  | IExpressionLike
  | IExpressionIsNull
  | IExpressionIsNotNull
  | IExpressionExists 
  | IExpressionPlus 
  | IExpressionAnd;

export interface IRelation {
  name: string;
  alias: string;
  join?: {
    type: 'INNER' | 'LEFT';
    relation: IRelation;
    condition?: Expression;
  }
  condition?: Expression;
};

export interface IEntityAdapter {
  relation: IRelation,
};