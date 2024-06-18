import { IReconciliationStatementRequestResult } from '@gsbelarus/util-api-types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrlApi } from '@gdmn/constants/client';

export const reconciliationStatementApi = createApi({
  reducerPath: 'reconciliationStatement',
  baseQuery: fetchBaseQuery({ baseUrl: baseUrlApi, credentials: 'include' }),
  endpoints: (builder) => ({
    getReconciliationStatement: builder.query<IReconciliationStatementRequestResult, { custId: number, dateBegin: Date, dateEnd: Date }>({
      query: ({ custId, dateBegin, dateEnd }) => `reports/reconciliation-statement/${custId}/${dateBegin.getTime()}-${dateEnd.getTime()}`
    }),
  }),
});

export const { useGetReconciliationStatementQuery } = reconciliationStatementApi;
