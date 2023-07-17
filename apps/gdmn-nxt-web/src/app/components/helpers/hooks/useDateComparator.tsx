import { useCallback } from 'react';

interface Options {
  withText?: boolean;
}

const useDateComparator = () => {
  const getDayDiff = useCallback((startDate: Date, endDate: Date, options?: Options) => {
    const msInDay = 24 * 60 * 60 * 1000;
    const days = Math.round(
      (startDate.getTime() - endDate.getTime()) / msInDay
    );
    let postfix = '';
    if (options?.withText) {
      const positiveDays = Math.abs(days);
      const lastNumber = positiveDays % 10;
      const preLast = positiveDays % 100;
      postfix = (() => {
        if (preLast >= 5 && preLast <= 20) return 'дней';
        if (lastNumber === 1) {
          return 'день';
        }
        if (lastNumber >= 2 && lastNumber <= 4) {
          return 'дня';
        }
        if (lastNumber >= 5 || lastNumber === 0) {
          return 'дней';
        }
        return '';
      })();
    }
    return { days, postfix };
  }, []);

  return { getDayDiff };
};

export default useDateComparator;
