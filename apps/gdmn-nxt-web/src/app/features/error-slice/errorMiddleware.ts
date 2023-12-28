import { Middleware } from '@reduxjs/toolkit';
import { setError } from './error-slice';

export const errorMiddleware: Middleware = ({ dispatch }) => (next) => (action) => {
  if (action && 'error' in action) {
    const errorData = action.payload?.data;
    if (typeof errorData === 'object' && errorData?.errorMessage) {
      const errorStatus = action.payload?.status ?? 0;
      dispatch(setError({ ...errorData, errorStatus }));
    }
  }

  return next(action);
};
