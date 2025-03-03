import { IExpectedReceipt, IRequestResult } from '@gsbelarus/util-api-types';
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
    getExpectedReceipts: builder.query<IExpectedReceipt[], { onDate: DateRange<Date>, includePerTime: boolean }>({
      query: ({ onDate, includePerTime }) => `reports/expected-receipts/${onDate[0]?.getTime()}-${onDate[1]?.getTime()}?includePerTime=${includePerTime}`,
      transformResponse: (res: IExpectedReceiptsRequestResult) => res.queries?.expectedReceipts || [],
    }),
  }),
});

export const { useGetExpectedReceiptsQuery } = expectedReceiptsApi;
