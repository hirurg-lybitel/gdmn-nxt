import { useCallback } from 'react';

const useDateComparator = () => {
  const getDayDiff = useCallback((startDate: Date, endDate: Date) => {
    const msInDay = 24 * 60 * 60 * 1000;
    return Math.round(
      (startDate.getTime() - endDate.getTime()) / msInDay,
    );
  }, []);

  return { getDayDiff };
};

export default useDateComparator;
