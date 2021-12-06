export const checkEmailAddress = (email: string) => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);

export function utilUseful(): string {
  return 'util-useful';
}
