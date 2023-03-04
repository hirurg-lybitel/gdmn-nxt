export function getCookie(name: string) {
  const cookie: {[key: string]: string} = {};
  const parts = document.cookie.split(';');
  parts.forEach(e => {
    const [key, value] = e.split('=');
    cookie[key.trim()] = value;
  });
  return cookie[name];
}
