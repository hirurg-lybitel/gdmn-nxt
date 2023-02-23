import * as crypto from 'crypto';

enum CypherInfo {
    key = '9f44fec72566f8090e19bec83e536768',
    algorithm = 'aes256'
}

export function encrypt(text:string) {
  const iv = crypto.randomBytes(8).toString('hex');
  const cipher = crypto.createCipheriv(CypherInfo.algorithm, CypherInfo.key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${encrypted}:${iv}`;
}

export function decrypt(text:string) {
  const [encryptedString, iv] = text.split(':');
  const decipher = crypto.createDecipheriv(CypherInfo.algorithm, CypherInfo.key, iv);

  let decrypted = decipher.update(encryptedString, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}