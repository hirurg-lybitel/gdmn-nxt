export const checkEmailAddress = (email: string | undefined) => !!email && /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);

const validPasswordChars = 'abcdefghijklmnopqrstuvwxyz0123456789.,!?*+-=$_%^&';

export const genRandomPassword = (len = 10) => Array(len)
  .fill(undefined)
  .map( _ => validPasswordChars.charAt(Math.floor(Math.random() * validPasswordChars.length)) )
  .map( c => Math.random() > 0.5 ? c.toUpperCase() : c )
  .join('');

export function utilUseful(): string {
  return 'util-useful';
};
