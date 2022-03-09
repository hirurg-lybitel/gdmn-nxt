export type FieldDataType = 'date' | 'timestamp' | 'curr' | 'boolean' | 'array';

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
  ID: number;
};

export interface IWithRUID {
  RUID: string;
};

export interface IWithParent {
  PARENT?: number;
};

export interface IBaseContact {
  NAME: string;
  PHONE?: string;
  EMAIL?: string;
  FOLDERNAME?: string;
};

export interface IContactWithID extends IBaseContact, IWithID, IWithParent {}

export interface ICompany extends IBaseContact {
  FULLNAME: string;
};

export interface IAccount {
  USR$FIRSTNAME: string;
  USR$LASTNAME: string;
  USR$POSITION?: string;
  USR$EXPIREON?: Date;
  USR$APPROVED?: boolean;
  USR$PHONE?: string;
  USR$EMAIL: string;
  USR$COMPANYKEY?: number;
  USR$HASH: string;
  USR$SALT: string;
};

export type IAccountWithID = IAccount & IWithID;

export interface IContactHierarchy {
  ID: number,
  PARENT?: number;
  LB: number;
  RB: number;
  NAME: string
}
export interface ILabelsContact extends IWithID {
  USR$CONTACTKEY: number;
  USR$LABELKEY: number;
}

export interface IContactWithLabels extends IContactWithID {
  labels?: ILabelsContact[]
}

export interface IContractJob extends IContactWithID {
  USR$NAME?: string;
};

export interface ICustomer extends IContactWithID {
  LABELS?: ILabelsContact[];
  CONTRACTS?: IContractJob[];
  DEPARTMETNS?: IContactWithID[];
}

export interface IResultError {
  errorMessage: string
}


export interface ICustomerContract {
  USR$NUMBER: string;
  USR$NAME: string;
  USR$DATEBEGIN: Date;
  USR$DATEEND: Date;
};

export type ICustomerContractWithID = ICustomerContract & IWithID;

export interface IDeal extends IWithID {
  USR$NAME: string;
  USR$AMOUNT?: number;
  USR$CONTACTKEY: number;
  CONTACT?: IContactWithID;
}

export interface IKanbanCard extends IWithID {
  USR$INDEX: number;
  USR$MASTERKEY: number;
  USR$DEALKEY?: number;
  DEAL?: IDeal;
};

export interface IKanbanColumn extends IWithID {
  USR$INDEX: number;
  USR$NAME: string;
  CARDS: IKanbanCard[];
};
