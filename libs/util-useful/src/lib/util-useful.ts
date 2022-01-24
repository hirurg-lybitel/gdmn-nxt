export function utilUseful(): string {
  return 'util-useful';
};

export const checkEmailAddress = (email: string | undefined) => !!email && /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);

const validPasswordChars = 'abcdefghijklmnopqrstuvwxyz0123456789'; // 'abcdefghijklmnopqrstuvwxyz0123456789.,!?*+-=$_%^&';

export const genRandomPassword = (len = 10, pc = validPasswordChars) => Array(len)
  .fill(undefined)
  .map( _ => pc.charAt(Math.floor(Math.random() * pc.length)) )
  .map( c => Math.random() > 0.5 ? c.toUpperCase() : c )
  .join('');


export const parseIntDef = (v: string, def = 0) => {
  const parsed = parseInt(v);
  return isNaN(parsed) ? def : parsed;
};
