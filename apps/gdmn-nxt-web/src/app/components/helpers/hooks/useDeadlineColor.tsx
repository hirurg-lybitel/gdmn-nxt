import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { ColorMode } from '@gsbelarus/util-api-types';

const useDeadlineColor = () => {
  const daysColor = (days: number): string => {
    if (days === 1) return 'rgb(255, 214, 0)';
    if (days <= 0) return 'rgb(255, 82, 82)';
    return '';
  };
  return { daysColor };
};

export default useDeadlineColor;
