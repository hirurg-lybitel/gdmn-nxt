export interface IAuthResult {
  result: 'SUCCESS'
    | 'UNKNOWN_USER'
    | 'INVALID_PASSWORD'
    /** email unknown to the system */
    | 'INVALID_EMAIL'
    | 'ACCESS_DENIED'
    | 'SERVER_UNAVAILABLE'
    | 'ERROR';
  message?: string;
};
