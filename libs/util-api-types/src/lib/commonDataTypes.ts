import { ContractType, ICustomer } from './crmDataTypes';

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
  [queryName: string]: IDataRecord[] | number | string;
};

export interface IRequestResult<R = IResults> {
  queries: R,
  _schema?: IDataSchema;
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
  NOTE?: string;
  ADDRESS?: string;
  FAX?: string;
};

export interface IContactWithID extends IBaseContact, IWithID { }

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
  NAME: string;
}
export interface IResultError {
  errorMessage: string,
  description?: string;
};

export interface IResultDescription {
  message: string;
  description?: string;
};

export type IEmployee = IContactWithID;

export interface IProfileSettings {
  AVATAR?: string | null;
  RANK?: string;
  FULLNAME?: string;
  COLORMODE?: ColorMode;
  LASTVERSION?: string;
  EMAIL?: string;
  SEND_EMAIL_NOTIFICATIONS?: boolean;
  PUSH_NOTIFICATIONS_ENABLED?: boolean;
  ENABLED_2FA?: boolean;
  REQUIRED_2FA?: boolean;
  SECRETKEY?: string;
  LAST_IP?: string;
  SAVEFILTERS?: boolean;
  ONE_TIME_PASSWORD?: boolean;
  PHONE?: string;
}

export interface ISystemSettings extends IWithID {
  CONTRACTTYPE: ContractType;
  OURCOMPANY?: ICustomer;
  smtpHost?: string;
  smtpUser?: string;
  smtpPassword?: string;
  smtpPort?: number;
}

export enum ColorMode {
  Light = 'light',
  Dark = 'dark',
}

export type GedeminUser = {
  id: number;
  userName: string;
  contactkey: number;
  rank?: string;
  colorMode?: ColorMode;
  fullName?: string;
  saveFilters: boolean;
};

export type TicketsUser = {
  id: number;
  userName: string;
  rank?: string;
  colorMode?: ColorMode;
  fullName?: string;
  saveFilters: boolean;
};

export interface IChanges {
  id: number;
  fieldName: string,
  oldValue: string | number | undefined;
  newValue: string | number | undefined;
};

export interface ISortingData {
  field: string;
  sort: 'asc' | 'desc' | null | undefined;
};

export interface IPaginationData {
  pageNo: number;
  pageSize: number;
};

export interface IFilteringData {
  [name: string]: any;
}

export interface IFilter extends IWithID {
  entityName: string;
  filters: IFilteringData;
}

export interface IQueryOptions {
  pagination?: IPaginationData;
  filter?: IFilteringData;
  sort?: ISortingData;
};

export function queryOptionsToParamsString(options?: IQueryOptions | void) {
  if (!options) return '';
  if (Object.keys(options).length === 0) return '';

  const params: string[] = [];

  for (const [name, value] of Object.entries(options || {})) {
    switch (true) {
      case typeof value === 'object' && value !== null:
        for (const [subName, subKey] of Object.entries(value)) {
          const subParams = [];
          if (typeof subKey === 'object' && subKey !== null) {
            for (const [subNameNested, subKeyNested] of Object.entries(subKey)) {
              if (typeof subKeyNested === 'object' && subKeyNested !== null) {
                subParams.push((subKeyNested as any).ID);
              };
              if (typeof subKeyNested === 'string') {
                subParams.push(subKeyNested);
              };
              if (typeof subKeyNested === 'number') {
                subParams.push(subKeyNested);
              };
            }
          } else {
            subParams.push(subKey);
          };
          params.push(`${subName}=${subParams}`);
        };
        break;

      default:
        params.push(`${name}=${value}`);
        break;
    }
  };

  return params.join('&');
};


export type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

type JSONValue =
  | string
  | number
  | boolean
  | JSONObject
  | JSONArray;

interface JSONObject {
  [x: string]: JSONValue;
}

export interface JSONArray extends Array<JSONValue> { }

export type IResponse<K extends string, T> = IRequestResult<{ [key in K]: T }>;
