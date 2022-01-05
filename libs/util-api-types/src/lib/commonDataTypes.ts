export interface IWithID {
  id: number;
};

export interface IWithRUID {
  ruid: string;
};

export interface IContact {
  name: string;
  phone?: string;
  email?: string;
};

export interface ICompany extends IContact {
  fullName: string;
};