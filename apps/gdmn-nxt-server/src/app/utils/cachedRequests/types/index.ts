import { IBusinessProcess, ILabel, IPhone, IUser } from '@gsbelarus/util-api-types';

export interface CustomerInfo {
  ID: number;
  USR$CUSTOMERKEY: number;
  USR$JOBKEY: number;
  USR$DEPOTKEY: number;
  USR$JOBWORKKEY: number;
};

export interface ContactBusiness extends IBusinessProcess {
  CONTACTKEY: number;
  PROCKEY: number;
};


export interface ContactLabel extends ILabel {
  USR$CONTACTKEY: number;
};

export interface Customer {
  ID: number;
  NAME: string;
  PHONE: string;
  EMAIL: string;
  TAXID: string;
  ADDRESS: string;
  FULLNAME: string;
  FAX: string;
  POSTADDRESS: string;
  ticketSystem?: boolean,
  openTickets?: number,
  closedTickets?: number;
  performer: IUser;
  PERFORMERKEY: number;
}

export interface Phone extends IPhone { }

export interface CustomerPerson {
  ID: number;
  NAME: string;
  EMAIL: string;
  RANK: string;
  PARENT: number;
}
