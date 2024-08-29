import dayjs, { Dayjs } from 'dayjs';
import ru from 'dayjs/locale/ru';
import duration from 'dayjs/plugin/duration';
import isBetween from 'dayjs/plugin/isBetween';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.locale(ru);
dayjs.extend(duration);
dayjs.extend(isBetween);
dayjs.extend(customParseFormat);

export { dayjs as default, Dayjs };

export const durationFormat = (duration?: string) => {
  if (!duration) {
    return '00:00:00';
  }

  const hours = dayjs.duration(duration).hours()
    .toString()
    .split('.')[0]
    .padStart(2, '0');
  const minutes = dayjs.duration(duration).minutes()
    .toString()
    .split('.')[0]
    .padStart(2, '0');
  const seconds = dayjs.duration(duration).seconds()
    .toString()
    .split('.')[0]
    .padStart(2, '0');

  return `${hours}:${minutes}:${seconds}`;
};
