export interface IDomainAdapter {
  name: string;
};

export interface IDomainBase {
  name: string;
  lName: string;
  visible?: boolean;
  readonly?: boolean;
  required?: boolean;
  validationSource?: string;
  adapter?: IDomainAdapter;
};

export interface IStringDomain extends IDomainBase {
  type: 'STRING',
  maxLen: number;
  charSetId: number;
  default?: string;
};

export interface INumDomainBase extends IDomainBase {
  max: number;
  min: number;
  default?: number;
};

export interface IDateDomainBase extends IDomainBase {
  max?: number;
  min?: number;
  default?: string;
};

export interface IDateDomain extends IDateDomainBase {
  type: 'DATE';
};

export interface ITimeDomain extends IDateDomainBase {
  type: 'TIME';
};

export interface ITimeStampDomain extends IDateDomainBase {
  type: 'TIMESTAMP';
};

export interface IIntegerDomain extends INumDomainBase {
  type: 'INTEGER';
};

export interface IBigIntDomain extends INumDomainBase {
  type: 'BIGINT';
};

export interface IDoubleDomain extends INumDomainBase {
  type: 'DOUBLE';
};

export interface INumericDomain extends INumDomainBase {
  type: 'NUMERIC';
  scale: number;
  precision: number;
};

export interface IEntityDomainAdapter {
  name: string;
  relation: string;
  listField?: string;
  condition?: string;
};

export interface IBooleanDomain extends IDomainBase {
  type: 'BOOLEAN';
  default?: boolean;
};

export interface IBlobDomain extends IDomainBase {
  type: 'BLOB';
  subType: number;
};

export interface IEnumDomain extends IDomainBase {
  type: 'ENUM';
  numeration: string;
};

export interface IEntityDomain extends IDomainBase {
  type: 'ENTITY';
  entityName: string;
  adapter?: IEntityDomainAdapter;
};

export interface IEntitySetDomain extends IDomainBase {
  type: 'ENTITY[]';
  entityName: string;
  adapter?: IEntityDomainAdapter;
};

export type Domain = IStringDomain
  | IIntegerDomain
  | IBigIntDomain
  | IDoubleDomain
  | INumericDomain
  | IDateDomain
  | ITimeDomain
  | ITimeStampDomain
  | IBooleanDomain
  | IBlobDomain
  | IEnumDomain
  | IEntityDomain
  | IEntitySetDomain;

export interface IDomains {
  [name: string]: Domain;
};

export interface IAttrAdapter {
  name: string;
};

export interface ICrossAttrAdapter extends IAttrAdapter {
  crossRelation: string;
  crossField: string;
};

export interface IAttrBase {
  name: string;
  domain: string;
  lName: string;
  readonly?: boolean;
  visible?: boolean;
  semCategory?: string;
  adapter?: IAttrAdapter;
};

export interface ISeqAttr {
  type: 'SEQ';
  name: string;
};

export function isSeqAttr(attr: Attr): attr is ISeqAttr {
  return 'type' in attr && attr.type === 'SEQ';
};

export interface IEntityAttr extends IAttrBase {
  type: 'ENTITY';
  entityName: string;
};

export interface IEntitySetAttr extends IAttrBase {
  type: 'ENTITY[]';
  entityName: string;
  adapter?: ICrossAttrAdapter;
};

export type Attr = IAttrBase | IEntityAttr | IEntitySetAttr | ISeqAttr;

export interface IEntityBase {
  parent?: string;
  name: string;
  lName?: string;
  abstract?: boolean;
  attributes: Attr[];
  semCategory?: string;
  adapter?: IEntityAdapter;
};

export interface IEntity extends IEntityBase {
  type: 'SIMPLE';
};

export interface IDocEntity extends IEntityBase {
  type: 'DOCUMENT';
};

export type Entity = IEntity | IDocEntity;

export interface IEntities {
  [name: string]: Entity;
};

export interface IERModel {
  /**
   * Full name of the database. Including host and port number.
   */
  fullDbName: string;
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
  right: IOperandQuery;
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

export interface IQueryAttr {
  entityAlias: string;
  attrName: string | '*';
  as?: string;
};

export interface IQueryEntity {
  entityName: string;
  as? : string;
};

export interface IERModelQuery {
  erModelName?: string;
  select: IQueryAttr[];
  from: IQueryEntity;
};

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

export interface IBaseDocTypes {
  TgdcDocumentType: [Entity, undefined];
  TgdcUserDocumentType: [Entity, Entity];
  TgdcInvDocumentType: [Entity, Entity];
  TgdcInvPriceListType: [Entity, Entity];
};
