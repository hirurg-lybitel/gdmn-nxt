import pluralize from './pluralize';

type time = 'seconds' | 'minute' | 'hour' | 'day' | 'month' | 'year';

export function timeAgo(date: Date, minTime: time = 'seconds'): string {
  const now = new Date();
  const openAt = new Date(date);
  const diffMs = now.getTime() - openAt.getTime();

  const sec = Math.floor(diffMs / 1000);
  const min = Math.floor(sec / 60);
  const hour = Math.floor(min / 60);
  const day = Math.floor(hour / 24);
  const month = Math.floor(day / 30);
  const year = Math.floor(month / 12);

  if (minTime === 'minute' && sec < 60) return '<1 минуты';
  if (minTime === 'hour' && min < 60) return '<1 часа';
  if (minTime === 'day' && hour < 24) return '<1 дня';
  if (minTime === 'month' && day < 30) return '<1 месяца';
  if (minTime === 'year' && month < 12) return '<1 года';

  if (sec < 60) return `${sec} ${pluralize(sec, 'секунду', 'секунды', 'секунд')}`;
  if (min < 60) return `${min} ${pluralize(min, 'минуту', 'минуты', 'минут')}`;
  if (hour < 24) return `${hour} ${pluralize(hour, 'час', 'часа', 'часов')}`;
  if (day < 30) return `${day} ${pluralize(day, 'день', 'дня', 'дней')}`;
  if (month < 12) return `${month} ${pluralize(month, 'месяц', 'месяца', 'месяцев')}`;
  return `${year} ${pluralize(year, 'год', 'года', 'лет')}`;
}

export function formatToFullDate(dateString: Date, time = true): string {
  const date = new Date(dateString);
  const pad = (n: number) => n.toString().padStart(2, '0');

  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  const dateTime = ` ${hours}:${minutes}`;

  return `${day}.${month}.${year}${time ? dateTime : ''}`;
}
