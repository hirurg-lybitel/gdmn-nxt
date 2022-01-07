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