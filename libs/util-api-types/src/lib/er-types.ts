export interface IDomainAdapter {
  name: string;
};

export interface IDomainBase {
  name: string;
  lName: string;
  readonly?: boolean;
  adapter?: IDomainAdapter;
};

export interface IStringDomain extends IDomainBase {
  type: 'STRING',
  maxLen: number;
  default?: string;
};

export interface INumDomainBase extends IDomainBase {
  max: number;
  min: number;
  default?: number;
};

export interface IIntegerDomain extends INumDomainBase {
  type: 'INTEGER';
};

export interface IDoubleDomain extends INumDomainBase {
  type: 'DOUBLE';
};

export interface IEntityDomainAdapter {
  name: string;
  relation: string;
  listField?: string;
  condition?: string;
};

export interface IEntityDomain extends IDomainBase {
  type: 'ENTITY';
  entityName: string;
  adapter?: IEntityDomainAdapter;
};

export type Domain = IStringDomain | IIntegerDomain | IDoubleDomain | IEntityDomain;

export interface IDomains {
  [name: string]: Domain;
};

export interface IAttrBase {
  name: string;
  domain: string;
  required?: boolean;
  semCategory?: string;
};

export interface ISeqAttr {
  type: 'SEQ';
  name: string;
};

export type Attr = IAttrBase | ISeqAttr;

export type Entity = IEntity;

export interface IEntity {
  parent?: string;
  name: string;
  abstract?: boolean;
  attributes: Attr[];
  semCategory?: string;
  adapter?: IEntityAdapter;
};

export interface IEntities {
  [name: string]: Entity;
};

export interface IERModel {
  domains: IDomains;
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

export interface IEntityAdapter {
  name: string;
  alias: string;
  join?: IJoinAdapter[];
  condition?: Expression;
};

export interface IJoinAdapter {
  type: 'INNER' | 'LEFT'; 
  name: string;
  alias: string;
  condition?: Expression;
};