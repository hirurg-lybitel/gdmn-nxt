import { Middleware } from '@reduxjs/toolkit';
import { setError } from './error-slice';

export const errorMiddleware: Middleware = ({dispatch}) => (next) => (action) => {

  if ('error' in action) {
    const errorData = action.payload?.data;
    if (errorData && 'errorMessage' in errorData) {
      // console.log('testMiddleware_error', errorData.errorMessage);
      dispatch(setError(errorData));
    }
  }

 return next(action);
};
