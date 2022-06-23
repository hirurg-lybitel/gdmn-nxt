import { IRequestResult } from '@gsbelarus/util-api-types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrlApi } from '../../const';

interface IRemainInvoices{
  remainInvoices: any[];
};

type IRemainInvoicesRequestResult = IRequestResult<IRemainInvoices>;

export const remainsInvoicesApi = createApi({
  reducerPath: 'remainsInvoices',
  baseQuery: fetchBaseQuery({ baseUrl: baseUrlApi, credentials: 'include' }),
  endpoints: (builder) => ({
    getRemainsInvoices: builder.query<any[], { onDate: Date }>({
      query: ({ onDate }) => `reports/remains-by-invoices/${onDate.getTime()}`,
      transformResponse: (res: IRemainInvoicesRequestResult) => res.queries?.remainInvoices || [],
    }),
  }),
});

export const { useGetRemainsInvoicesQuery } = remainsInvoicesApi;
