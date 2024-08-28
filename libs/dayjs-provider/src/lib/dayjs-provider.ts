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
