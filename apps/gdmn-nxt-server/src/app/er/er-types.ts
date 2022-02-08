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
  name: string;
  abstract?: boolean;
  parent?: Entity;
  attributes: Attr[];
};

export interface IEntities {
  [name: string]: IEntity;
};

export interface IERModel {
  entities: IEntities;
};