/**
 *  These types are intended for use in the CRM web and back server.
 */

import { IRequestResult } from '..';
import { IContactWithID, IDataRecord, IWithID } from './commonDataTypes';

export interface IReconciliationStatement {
  customerDebt: IDataRecord[];
  customerAct: IDataRecord[];
  contact: IDataRecord[];
  saldo: IDataRecord[];
  movement: IDataRecord[];
  payment: IDataRecord[];
  firm: IDataRecord[];
};

export type IReconciliationStatementRequestResult = IRequestResult<IReconciliationStatement>;

export interface ILabelsContact extends IWithID {
  USR$CONTACTKEY: number;
  USR$LABELKEY: number;
};

export interface IContactWithLabels extends IContactWithID {
  labels?: ILabelsContact[]
};

export interface IContractJob extends IContactWithID {
  USR$NAME?: string;
};

export interface ICustomer extends IContactWithID {
  LABELS?: ILabelsContact[];
  CONTRACTS?: IContractJob[];
  DEPARTMETNS?: IContactWithID[];
};

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

export interface IKanbanHistory extends IWithID {
  USR$DATE: Date;
  USR$TYPE: string;
  USR$DESCRIPTION: string;
  USR$OLD_VALUE: string;
  USR$NEW_VALUE: string;
  USR$USERKEY: number;
  USERNAME: string;
};

export interface IActCompletion extends IWithID {
  NUMBER: string;
  DOCUMENTDATE: Date;
  DEPT_NAME: string;
  JOB_NUMBER: string;
  USR$SUMNCU: number;
};

export interface IBankStatement extends IWithID {
  NUMBER: string;
  DOCUMENTDATE: Date;
  DEPT_NAME: string;
  JOB_NUMBER: string;
  CSUMNCU: number;
  COMMENT: string;
};

export interface IChartSumByperiod {
  ONDATE: Date;
  AMOUNT: number;
};
