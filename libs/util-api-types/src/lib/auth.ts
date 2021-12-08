export type AuthResult =
  'SUCCESS'

  /** Registration of the new user */

  /** Provided data is invalid */
  | 'INVALID_DATA'
  | 'DUPLICATE_USER_NAME'
  | 'DUPLICATE_EMAIL'

  | 'SUCCESS_USER_CREATED'

  | 'UNKNOWN_USER'
  | 'INVALID_PASSWORD'
  /** email unknown to the system */
  | 'INVALID_EMAIL'
  | 'ACCESS_DENIED'
  | 'SERVER_UNAVAILABLE'

  /** any other error */
  | 'ERROR';

export interface IAuthResult {
  result: AuthResult;
  message?: string;
};

export const authResult = (result: AuthResult, message?: string): IAuthResult => ({ result, message });
