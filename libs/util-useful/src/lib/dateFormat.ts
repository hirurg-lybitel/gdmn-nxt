import pluralize from './pluralize';

export function timeAgo(date: Date): string {
  const now = new Date();
  const openAt = new Date(date);
  const diffMs = now.getTime() - openAt.getTime();

  const sec = Math.floor(diffMs / 1000);
  const min = Math.floor(sec / 60);
  const hour = Math.floor(min / 60);
  const day = Math.floor(hour / 24);
  const month = Math.floor(day / 30);
  const year = Math.floor(month / 12);

  if (sec < 60) return `${sec} ${pluralize(sec, 'секунду', 'секунды', 'секунд')} назад`;
  if (min < 60) return `${min} ${pluralize(min, 'минуту', 'минуты', 'минут')} назад`;
  if (hour < 24) return `${hour} ${pluralize(hour, 'час', 'часа', 'часов')} назад`;
  if (day < 30) return `${day} ${pluralize(day, 'день', 'дня', 'дней')} назад`;
  if (month < 12) return `${month} ${pluralize(month, 'месяц', 'месяца', 'месяцев')} назад`;
  return `${year} ${pluralize(year, 'год', 'года', 'лет')} назад`;
}

export function formatToFullDate(dateString: Date): string {
  const date = new Date(dateString);
  const pad = (n: number) => n.toString().padStart(2, '0');

  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${day}.${month}.${year} ${hours}:${minutes}`;
}
