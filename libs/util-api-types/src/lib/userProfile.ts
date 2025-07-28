import { Permissions, UserType } from './crmDataTypes';

export interface IUserProfile {
  id?: number,
  userName: string;
  firstname?: string;
  surname?: string;
  contactkey?: number,
  rank?: string;
  permissions?: Permissions;
  email?: string;
  password?: string;
  qr?: string;
  base32Secret?: string;
  colorMode?: string;
  fullName?: string;
  type?: UserType;
  companyKey?: number;
  isAdmin?: boolean;
};
