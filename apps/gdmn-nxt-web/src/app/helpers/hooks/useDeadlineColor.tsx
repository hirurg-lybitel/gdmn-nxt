import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@gdmn-nxt/store';
import { ColorMode } from '@gsbelarus/util-api-types';

const useDeadlineColor = () => {
  const daysColor = (days: number): string => {
    if (days === 1) return 'darkorange';
    if (days <= 0) return 'rgb(255, 82, 82)';
    return '';
  };
  return { daysColor };
};

export default useDeadlineColor;
