export function generatePassword(length: number) {
  const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += letters[Math.floor(Math.random() * letters.length)];
  }
  return password;
}
