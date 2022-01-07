export type FieldDataType = 'date' | 'curr';

export interface IFieldSchema {
  type: FieldDataType;
}

export interface ITableSchema {
  [fldName: string]: IFieldSchema;
};

export interface IDataSchema {
  [tableName: string]: ITableSchema;
};

export interface IQuery {
  name: string;
  query: string;
  params: any[];
};

export interface IDataRecord {
  [fldName: string]: any;
};

export interface IResults {
  [queryName: string]: IDataRecord[];
};

export interface IRequestResult<R = IResults> {
  queries: R,
  _schema: IDataSchema;
  _params?: [IDataRecord];
};

export interface IWithID {
  id: number;
};

export interface IWithRUID {
  ruid: string;
};

export interface IBaseContact {
  name: string;
  phone?: string;
  email?: string;
  folderName?: string;
};

export interface ICompany extends IBaseContact {
  fullName: string;
};