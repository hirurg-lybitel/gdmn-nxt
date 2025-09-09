import { BaseQueryFn, FetchArgs, fetchBaseQuery, FetchBaseQueryError, FetchBaseQueryMeta } from '@reduxjs/toolkit/dist/query';
import { RootState } from './index';
import { UserType } from '@gsbelarus/util-api-types';
import { baseUrlApi, ticketsBaseUrlApi } from '../constants';
import { FetchBaseQueryArgs } from '@reduxjs/toolkit/dist/query/fetchBaseQuery';

export const getBaseUrlByUserType = (type?: UserType) => {
  switch (type) {
    case UserType.Tickets: return ticketsBaseUrlApi;
    case UserType.Gedemin: return baseUrlApi;
    default: return baseUrlApi;
  }
};

export const baseQueryByUserType = (params?: FetchBaseQueryArgs): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError, {}, FetchBaseQueryMeta> => {
  const { baseUrl, ...rest } = (params ?? {});
  return async (args, api, extraOptions) => {
    const state = api.getState() as RootState;
    const userType = state.user.userProfile?.type;

    const apiBaseUrl = getBaseUrlByUserType(userType);

    const rawBaseQuery = fetchBaseQuery({
      baseUrl: apiBaseUrl + (baseUrl ?? ''),
      credentials: 'include',
      ...rest
    });

    return rawBaseQuery(args, api, extraOptions);
  };
};
