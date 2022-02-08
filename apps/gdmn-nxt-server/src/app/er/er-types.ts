export interface IEntity {
  name: string;
  attributes: IAttr[];
};

export interface IAttr {
  name: string;
};

export interface IEntities {
  [name: string]: IEntity;
};