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
  parent?: Entity;
  name: string;
  abstract?: boolean;
  attributes: Attr[];
  adapter?: IEntityAdapter;
};

export interface IEntities {
  [name: string]: IEntity;
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

export type Operand = IOperandField | IOperandList | IOperandValue;

export interface IConditionIn {
  operator: 'IN';
  left: Operand;
  right: Operand;
};

export interface IConditionEq {
  operator: 'EQ';
  left: Operand;
  right: Operand;
};

export type Condition = IConditionIn;

export interface IEntityAdapter {
  relation: {
    name: string; 
    alias: string;
  },
  condition?: Condition;
};