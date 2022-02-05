import { IResultError } from '@gsbelarus/util-api-types';

export const resultError = (message: string):IResultError => {
  return {errorMessage: message};
}
