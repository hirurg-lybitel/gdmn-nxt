import { IExpectedReceipt, IQueryOptions, IRequestResult, queryOptionsToParamsString } from '@gsbelarus/util-api-types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrlApi } from '@gdmn/constants/client';
import { DateRange } from '@mui/x-date-pickers-pro';

interface IExpectedReceipts{
  expectedReceipts: IExpectedReceipt[];
};

type IExpectedReceiptsRequestResult = IRequestResult<IExpectedReceipts>;

export const expectedReceiptsApi = createApi({
  reducerPath: 'expectedReceipt',
  baseQuery: fetchBaseQuery({ baseUrl: baseUrlApi, credentials: 'include' }),
  endpoints: (builder) => ({
    getExpectedReceipts: builder.query<IExpectedReceipt[], { onDate: DateRange<Date>, options: Partial<IQueryOptions> | void }>({
      query: ({ onDate, options }) => {
        const params = queryOptionsToParamsString(options);
        return `reports/expected-receipts/${onDate[0]?.getTime()}-${onDate[1]?.getTime()}${params ? `?${params}` : ''}`;
      },
      transformResponse: (res: IExpectedReceiptsRequestResult) => res.queries?.expectedReceipts || [],
    }),
  }),
});

export const { useGetExpectedReceiptsQuery } = expectedReceiptsApi;
