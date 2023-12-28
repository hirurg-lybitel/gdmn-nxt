import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';

const issuer = 'GoldenSoftware';

interface ISecret {
  email: string;
  qr: string;
  base32Secret: string;
  error: string;
}

export async function generateSecret(email: string): Promise<ISecret> {
  const defaultReturn = {
    email: '',
    qr: '',
    base32Secret: '',
    error: ''
  };

  if (!email) return defaultReturn;

  try {
    const secret = authenticator.generateSecret();

    const url = await toDataURL(authenticator.keyuri(email, issuer, secret));
    return {
      ...defaultReturn,
      email,
      qr: url,
      base32Secret: secret,
    };
  } catch (error) {
    return {
      ...defaultReturn,
      error
    };
  }
}


export async function verifyCode(email: string, code: string, secretKey: string) {
  try {
    if (!email) {
      return false;
    }

    if (!authenticator.check(code, secretKey)) {
      console.error('[ error ] Unavailable code');
      return false;
    }

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
