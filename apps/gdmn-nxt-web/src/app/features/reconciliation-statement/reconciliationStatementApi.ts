import { IReconciliationStatementRequestResult } from '@gsbelarus/util-api-types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrl } from '../../const';

export const reconciliationStatementApi = createApi({
  reducerPath: 'reconciliationStatement',
  baseQuery: fetchBaseQuery({ baseUrl }),
  endpoints: (builder) => ({
    getReconciliationStatement: builder.query<IReconciliationStatementRequestResult, { custId: number, dateBegin: Date, dateEnd: Date }>({
      query: ({ custId, dateBegin, dateEnd }) => `reconciliation-statement/${custId}/${dateBegin.getTime()}-${dateEnd.getTime()}`
    }),
  }),
});

export const { useGetReconciliationStatementQuery } = reconciliationStatementApi;
