/**
 *  These types are intended for use in the CRM web and back server.
 */

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

export interface ILabelsContact extends IWithID {
  USR$CONTACTKEY: number;
  USR$LABELKEY: number;
};

export interface IContactWithLabels extends IContactWithID {
  labels?: ILabelsContact[];
};

export interface IContractJob extends IContactWithID {
  USR$NAME?: string;
};

export interface ICustomer extends IContactWithID {
  LABELS?: ILabel[];
  CONTRACTS?: ICustomerContractWithID[];
  JOBWORKS?: IWorkType[];
  DEPARTMENTS?: IContactWithID[];
  TAXID?: string;
  FULLNAME?: string;
  POSTADDRESS?: string;
  BUSINESSPROCESSES?: IBusinessProcess[];
  isFavorite?: boolean;
  taskCount?: number;
  agreementCount?: number;
  debt?: number;
  feedback?: ICustomerFeedback[];
  TICKETSYSTEM?: boolean,
  OPENTICKETS?: number,
  CLOSEDTICKETS?: number;
  ALLTICKETS?: number;
  performer?: IUser;
};

interface IMapOfArrays {
  [key: string]: any[];
};

export interface ICustomerCross {
  departments: IMapOfArrays,
  contracts: IMapOfArrays,
  jobWorks: IMapOfArrays,
  persons: IMapOfArrays,
  // businessProcesses: IMapOfArrays,
};

export interface ICustomerContract extends IWithID {
  USR$NUMBER: string;
  USR$NAME: string;
  USR$DATEBEGIN: Date;
  USR$DATEEND: Date;
};

export type ICustomerContractWithID = ICustomerContract & IWithID;

export interface IDealFeedbackResult {
  id: number;
  name: string;
}

export interface IDealFeedbackCompetence {
  id: number;
  name: string;
}

export interface IDealFeedbackSatisfaction {
  id: number;
  name: string;
}

export interface IDealFeedbackSatisfactionRate {
  id: number;
  name: string;
}

export interface IDealFeedback {
  id: number;
  dealId: number;
  date?: string;
  suggestion?: string;
  response?: string;
  result?: IDealFeedbackResult;
  competence?: IDealFeedbackCompetence;
  satisfaction?: IDealFeedbackSatisfaction;
  satisfactionRate?: IDealFeedbackSatisfactionRate;
  replyEmail?: boolean;
};

export interface IDeal extends IWithID {
  USR$NAME?: string;
  USR$AMOUNT?: number;
  CONTACT?: IContactWithID;
  PERFORMERS?: IContactWithID[];
  CREATOR?: IContactWithID;
  SOURCE?: IDealSource;
  USR$DEADLINE?: Date;
  USR$CONTACTKEY?: number;
  USR$DISABLED?: boolean;
  USR$DONE?: boolean;
  USR$READYTOWORK?: boolean;
  DEPARTMENT?: IContactWithID;
  DENYREASON?: IDenyReason;
  DENIED?: boolean;
  COMMENT?: string;
  REQUESTNUMBER?: string;
  PRODUCTNAME?: string;
  CONTACT_NAME?: string;
  CONTACT_EMAIL?: string;
  CONTACT_PHONE?: string;
  CREATIONDATE?: Date;
  DESCRIPTION?: string;
  USR$NUMBER?: number;
  PREPAID?: boolean;
  ATTACHMENTS?: MailAttachment[];
  feedback?: IDealFeedback;
};

export interface IKanbanCard extends IWithID {
  USR$INDEX: number;
  USR$MASTERKEY: number;
  USR$DEALKEY?: number;
  DEAL?: IDeal;
  TASKS?: IKanbanTask[];
  TASK?: IKanbanTask;
  STATUS?: IKanbanCardStatus;
};

export interface IKanbanColumn extends IWithID {
  USR$INDEX: number;
  USR$NAME: string;
  CARDS: IKanbanCard[];
};

export interface IKanbanHistory extends IWithID {
  USR$DATE?: Date;
  USR$TYPE: string;
  USR$DESCRIPTION: string;
  USR$OLD_VALUE: string;
  USR$NEW_VALUE: string;
  USR$USERKEY: number;
  USR$CARDKEY: number,
  USERNAME?: string;
};

export interface IKanbanTask extends IWithID {
  USR$NAME: string;
  USR$DEADLINE?: Date;
  PERFORMER?: IContactWithID;
  CREATOR: IContactWithID | undefined;
  USR$DATECLOSE?: Date;
  USR$CREATIONDATE?: Date;
  USR$CARDKEY: number;
  USR$CLOSED: boolean;
  TASKTYPE?: ITaskType;
  USR$NUMBER?: number;
  USR$INPROGRESS?: boolean;
  DESCRIPTION?: string;
};

export interface IKanbanTaskInfo extends IKanbanTask {
  CONTACT?: IContactWithID;
  APPLICANT_NAME?: string;
};

export interface IActCompletion extends IWithID {
  NUMBER: string;
  DOCUMENTDATE: Date;
  DEPT_NAME: string;
  JOB_NUMBER: string;
  USR$SUMNCU: number;
  JOBWORKNAME?: string;
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

export interface IChartBusinessProcesses {
  name: string;
  amount: number;
}
export interface IChartBusinessDirection {
  name: string;
  amount: number;
  businessProcesses: IChartBusinessProcesses[];
};

export interface IPhone extends IWithID {
  USR$CONTACTKEY?: number;
  USR$PHONENUMBER: string;
}

export interface IEmail extends IWithID {
  CONTACTKEY?: number;
  EMAIL: string;
}

export type MessengerCode = 'facebook'
  | 'instagram'
  | 'telegram'
  | 'viber'
  | 'linkedin'
  | 'skype'
  | 'ok'
  | 'whatsApp'
  | 'github'
  | 'vk'
  | 'discord';

export interface IMessenger extends IWithID {
  USR$CONTACTKEY?: number;
  USERNAME: string;
  CODE: MessengerCode;
}

export interface IContactPerson extends IContactWithID {
  USR$BG_OTDEL?: IContactWithID;
  RANK?: string;
  USR$LETTER_OF_AUTHORITY?: string;
  RESPONDENT?: IContactPerson;
  PHONES?: IPhone[];
  EMAILS?: IEmail[];
  MESSENGERS?: IMessenger[];
  LABELS?: ILabel[];
  PHOTO?: string;
  COMPANY?: IContactWithID | null;
  isFavorite?: boolean;
  nameInfo?: IContactName;
  ISGEDEMINUSER?: boolean;
};

export interface IContract extends IWithID {
  NUMBER: string;
  DOCUMENTDATE: Date;
  DEPT_NAME: string;
  JOB_NUMBER: string;
  SUMNCU: number;
  SUMCURNCU: number;
  ISACTIVE: boolean;
  ISBUDGET: boolean;
  DATEBEGIN: Date;
  DATEEND: Date;
  customer: ICustomer;
  withDetails: boolean;
};

export interface IContractDetail extends IWithID {
  CONTRACTID: number;
  QUANTITY: number;
  PRICE: number;
  AMOUNT: number;
}

export enum ContractType {
  GS = 1,
  BG = 2,
}

export interface IWorkType extends IWithID {
  USR$NAME: string;
  USR$CONTRACTJOBKEY: number;
};

export interface ILabel extends IWithID {
  USR$NAME: string;
  USR$COLOR?: string;
  USR$DESCRIPTION?: string;
  USR$ICON: string;
};

export interface IPermissionsAction extends IWithID {
  NAME: string;
  ISACTIVE: boolean;
  CODE: number;
};

export interface IUserGroup extends IWithID {
  NAME: string;
  DESCRIPTION?: string;
  REQUIRED_2FA?: boolean;
};

export interface IUser extends IWithID {
  NAME: string;
  FULLNAME?: string;
  CONTACT?: IContactWithID;
  DISABLED?: boolean;
  isActivated?: boolean;
  AVATAR?: string;
};

export interface IPermissionsView extends IWithID {
  ACTION: IPermissionsAction;
  USERGROUP: IUserGroup;
  MODE: number;
};

export interface IUserGroupLine extends IWithID {
  USERGROUP: IUserGroup;
  USER?: IUser;
  REQUIRED_2FA?: boolean;
  STATUS?: boolean;
};

export interface IPermissionByUser {
  CODE: number;
  MODE: number;
};

export interface IDenyReason extends IWithID {
  NAME: string;
};

export interface IBusinessProcess extends IWithID {
  NAME: string;
}

export interface IDealSource extends IWithID {
  NAME: string;
}

export interface ITaskType extends IWithID {
  NAME: string;
  DESCRIPTION?: string;
}

export interface IKanbanFilterDeadline extends IWithID {
  CODE: number;
  NAME: string;
}

export interface IKanbanLastUsedFilterDeadline extends IWithID {
  USER: IUser;
  FILTER: IKanbanFilterDeadline;
}

type RouteMethod = 'POST' | 'GET' | 'PUT' | 'DELETE';
export type ActionName =
  'deals' |
  'labels' |
  'permissions' |
  'notifications' |
  'faq' |
  'tasks' |
  'customers' |
  'updates' |
  'stages' |
  'contacts' |
  'system' |
  'mailings' |
  'feedback' |
  'time-tracking' |
  'time-tracking/projects' |
  'time-tracking/projectTypes' |
  'time-tracking/tasks' |
  'reports/expected-receipts' |
  'reports/expected-receipts-dev' |
  'reports/expenses' |
  'reports/topEarning' |
  'reports/remains-by-invoices' |
  'reports/reconciliation-statement' |
  'reports/debts' |
  'reports/revenue' |
  'ticketSystem/tickets' |
  'contacts/tickets' |
  '';
export type ActionMethod = RouteMethod | 'ALL' | 'COPY' | 'forGroup' | '';

export type Permissions = {
  [key in ActionName]: {
    [key in (ActionMethod)]: boolean;
  }
};

export interface IUpdateHistory extends IWithID {
  VERSION: string;
  CHANGES: string;
  ONDATE: Date;
}

export interface IKanbanCardStatus {
  isRead?: boolean;
  userId?: number;
  cardId?: number;
}

export interface IDealDocument extends IWithID {
  DESCRIPTION: string;
}

export interface IClientHistoryType extends IWithID {
  NAME: string;
  ICON?: number;
}

export interface IClientHistory extends IWithID {
  CREATIONDATE?: Date;
  CONTENT: string;
  CREATOR: IContactWithID;
  CARDKEY: number,
  historyType: IClientHistoryType;
}

export interface IConfirmation extends IWithID {
  USER: number;
  EMAIL: string;
  CODE: string;
  ATTEMPTS?: number;
  CREATIONDATE?: Date;
}

export interface IFavoriteContact extends IWithID {
  USER?: number;
  CONTACT: IContactWithID;
}

export interface ISegmnentField {
  NAME: string;
  VALUE: string;
}

export interface ISegment extends IWithID {
  NAME: string;
  QUANTITY: number;
  FIELDS: ISegmnentField[];
  CUSTOMERS?: number[];
}

export enum MailingStatus {
  delayed = 0,
  completed = 1,
  error = 2,
  manual = 3,
  inProgress = 4,
  launchNow = 5
}

export interface MailAttachment {
  fileName: string;
  content: string;
}

export interface IMailing extends IWithID {
  NAME: string;
  LAUNCHDATE?: Date;
  STARTDATE?: Date;
  FINISHDATE?: Date;
  STATUS?: MailingStatus;
  STATUS_DESCRIPTION?: string;
  TEMPLATE?: string;
  includeSegments?: ISegment[],
  excludeSegments?: ISegment[],
  testingEmails?: string[];
  attachments?: MailAttachment[];
  recipientsCount?: number;
}

export interface IMailingHistory {
  id: number;
  date: string;
  mailingId: number;
  status: MailingStatus;
  description: string;
  customer: ICustomer;
}

export interface ITemplate extends IWithID {
  NAME: string;
  HTML: string;
}

// TODO: change to ICustomerFeedback
export interface IMailingFeedback extends IWithID {
  customer: ICustomer;
  mailing: IMailing;
  response?: string;
  toDo?: string;
}

export enum CustomerFeedbackType {
  email = 0,
  visit = 1,
  chat = 2,
  request = 3,
  call = 5
}

export interface ICustomerFeedback extends IWithID {
  type: CustomerFeedbackType;
  customer: ICustomer;
  mailing?: IMailing;
  response?: string;
  toDo?: string;
  creationDate?: Date;
  creator?: IUser;
}

export enum WorkProjectStatus {
  active = 0,
  suspended = 1,
  completed = 2
}
export interface IWorkProject extends IWithID {
  NAME: string;
  STATUS?: WorkProjectStatus;
  isFavorite?: boolean;
}

export interface IFavoriteWorkProject extends IWithID {
  user?: number;
  workProject?: IWorkProject;
}

export interface IFavoriteTask extends IWithID {
  user?: number;
  task?: IWorkProject;
}

export interface IFavoriteProject extends IWithID {
  user?: number;
  project?: IWorkProject;
}

export interface ITimeTrack extends IWithID {
  date: Date;
  startTime?: Date | null;
  endTime?: Date | null;
  duration?: string;
  customer?: ICustomer | null;
  description: string;
  inProgress?: boolean;
  user?: IUser;
  billable?: boolean;
  task?: ITimeTrackTask;
}

export interface ITimeTrackGroup {
  date: Date,
  duration: string;
  items: ITimeTrack[];
}

export interface IProjectStatistics {
  id: number;
  name: string;
  totalDuration: string;
  billableDuration: string;
  nonBillableDuration: string;
}

export interface ITimeTrackProject extends IWithID {
  name: string;
  customer?: ICustomer;
  tasks?: ITimeTrackTask[];
  isFavorite?: boolean,
  employees?: IContactWithID[],
  note?: string,
  isPrivate?: boolean,
  isDone?: boolean,
  projectType?: IProjectType,
  creator?: IContactWithID;
}

export interface ITimeTrackTask extends IWithID {
  name: string;
  isActive: boolean,
  project?: ITimeTrackProject;
  isFavorite?: boolean;
  inUse?: boolean;
}

export interface IContactName {
  lastName: string;
  firstName?: string;
  middleName?: string;
  nickName: string;
}

export interface IProjectType extends IWithID {
  name: string,
  parent?: string;
}

export interface IExpectedReceipt {
  customer?: ICustomer,
  respondents?: string[],
  count: number,
  fixedPayment?: {
    baseValues?: number,
    amount: number;
  },
  workstationPayment?: {
    count: number,
    baseValues?: number,
    amount: number;
  },
  perTimePayment?: {
    baseValues?: number,
    perHour: number,
    hoursAvarage: number,
    amount: number;
  },
  amount: number,
  valAmount: number;
}

export interface IExpectedReceiptDev {
  customer?: ICustomer,
  number: string,
  dateBegin: string,
  dateEnd: string,
  expired?: number,
  planned: boolean,
  subject: string,
  amount: {
    value: number,
    currency: number;
  },
  done?: {
    value: number,
    currency: number;
  },
  paid?: {
    value: number,
    currency: number;
  },
  rest: {
    value: number,
    currency: number;
  };
}

export interface IExpense {
  expenseName: string,
  amount: number,
  valAmount: number;
}

export interface IDebt {
  customer: ICustomer,
  saldoBegin: {
    value: number,
    currency: number;
  },
  saldoEnd: {
    value: number,
    currency: number;
  },
  done: number,
  paid: number,
  change: number;
}

export interface IRevenue {
  customer: ICustomer,
  date: string,
  amount: number,
  amountCurrency: number;
}

export enum UserType {
  Tickets = 'tickets',
  Gedemin = 'gedemin',
  Customer = 'customer'
};

export interface ICRMTicketUser extends IWithID {
  fullName: string;
  phone?: string,
  email?: string,
  avatar?: string;
}

export interface ITicketState extends IWithID {
  name: string,
  code: number;
}

export interface ITicket extends IWithID {
  title: string;
  company: ICustomer,
  openAt: Date;
  closeAt?: Date;
  closeBy?: ICRMTicketUser,
  state: ITicketState,
  sender: ICRMTicketUser;
  performer?: ICRMTicketUser;
  needCall: boolean;
  message?: string;
  files?: ITicketMessageFile[];
}

export interface ITicketMessageFile {
  fileName: string;
  size: number;
  content: string;
}

export interface ITicketMessage extends IWithID {
  body: string,
  ticketKey: number,
  user: ICRMTicketUser & { type: 'empl' | 'user'; },
  state: ITicketState;
  sendAt: Date;
  files?: ITicketMessageFile[];
}

export interface ICustomerTickets {
  customer?: ICustomer,
  email?: string,
  admin?: {
    name: string,
    fullName: string,
    password: string;
  };
  performer?: IUser;
}

export interface ITicketUser extends IWithID {
  company: ICustomer,
  password?: string,
  fullName: string,
  userName?: string,
  email?: string,
  phone?: string,
  isAdmin?: boolean;
  oneTimePassword?: boolean;
}

export interface IChangePassword {
  password?: string;
  newPassword?: string,
  repeatPassword?: string;
}
