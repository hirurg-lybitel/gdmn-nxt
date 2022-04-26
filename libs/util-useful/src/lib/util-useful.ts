import type { Language } from '@gsbelarus/util-api-types';

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

export const detectLanguage = (s: string): Language => {

  interface I {
    letters: string;
    language: Language;
    score: number;
  };

  const alphabets: I[] = [
    {
      letters: 'абвгдеёжзийклмнопрстуфхцчшщъыьэюяАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ',
      language: 'ru',
      score: 0
    },
    {
      letters: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
      language: 'en',
      score: 0
    },
    {
      letters: 'абвгдеёжзійклмнопрстуўфхцчш\'ыьэюяАБВГДЕЁЖЗІЙКЛМНОПРСТУЎФХЦЧШ\'ЫЬЭЮЯ',
      language: 'be',
      score: 0
    },
  ];

  for (let i = 0; i < s.length; i++) {
    const ch = s.charAt(i);
    for (let j = 0; j < alphabets.length; j++) {
      if (alphabets[j].letters.includes(ch)) {
        alphabets[j].score++;
      }
    }
  }

  return alphabets.sort( (a, b) => b.score - a.score )[0].language;
};
