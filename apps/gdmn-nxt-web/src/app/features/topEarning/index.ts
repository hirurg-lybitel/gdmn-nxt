import { IRequestResult } from '@gsbelarus/util-api-types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrlApi } from '../../const';

interface ITopEarning{
  topEarning: any[];
};

type ITopEarningRequestResult = IRequestResult<ITopEarning>;

export const topEarningApi = createApi({
  reducerPath: 'topEarning',
  baseQuery: fetchBaseQuery({ baseUrl: baseUrlApi, credentials: 'include' }),
  endpoints: (builder) => ({
    getTopEarning: builder.mutation<any[], Partial<any>>({
      query: (body) => ({
        url: 'reports/topEarning',
        method: 'POST',
        body
      }),
      transformResponse: (res: ITopEarningRequestResult) => res.queries?.topEarning || [],
    }),
  }),
});

export const { useGetTopEarningMutation: useGetTopEarningQuery } = topEarningApi;
