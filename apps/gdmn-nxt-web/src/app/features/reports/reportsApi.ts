import { IDebt, IExpectedReceipt, IExpectedReceiptDev, IExpense, IQueryOptions, IReconciliationStatement, IRequestResult, IRevenue, queryOptionsToParamsString } from '@gsbelarus/util-api-types';
import { createApi } from '@reduxjs/toolkit/query/react';
import { DateRange } from '@mui/x-date-pickers-pro';
import { baseQueryByUserType } from '@gdmn-nxt/store/baseUrl';

interface IExpectedReceipts {
  expectedReceipts: IExpectedReceipt[];
};

type IExpectedReceiptsRequestResult = IRequestResult<IExpectedReceipts>;

interface IExpectedReceiptsDev {
  expectedReceiptsDev: IExpectedReceiptDev[];
};

type IExpectedReceiptsDevRequestResult = IRequestResult<IExpectedReceiptsDev>;

interface IExpenses {
  expenses: IExpense[];
};

type IExpensesRequestResult = IRequestResult<IExpenses>;

interface IRemainInvoices {
  remainInvoices: any[];
};

interface IDebts {
  debts: IDebt[];
};

type IDebtRequestResult = IRequestResult<IDebts>;

interface IRevenues {
  revenue: IRevenue[];
};

type IRevenueRequestResult = IRequestResult<IRevenues>;

type IRemainInvoicesRequestResult = IRequestResult<IRemainInvoices>;

type IReconciliationStatementRequestResult = IRequestResult<IReconciliationStatement>;

interface ITopEarning {
  topEarning: any[];
};

type ITopEarningRequestResult = IRequestResult<ITopEarning>;

export const reportsApi = createApi({
  reducerPath: 'expectedReceipt',
  baseQuery: baseQueryByUserType({ baseUrl: 'reports', credentials: 'include' }),
  endpoints: (builder) => ({
    getExpectedReceipts: builder.query<IExpectedReceipt[], { onDate: DateRange<Date>, options: Partial<IQueryOptions> | void; }>({
      query: ({ onDate, options }) => {
        const params = queryOptionsToParamsString(options);
        return `expected-receipts/${onDate[0]?.getTime()}-${onDate[1]?.getTime()}${params ? `?${params}` : ''}`;
      },
      transformResponse: (res: IExpectedReceiptsRequestResult) => res.queries?.expectedReceipts || [],
      keepUnusedDataFor: 0
    }),
    getExpectedReceiptsDev: builder.query<IExpectedReceiptDev[], { onDate: DateRange<Date>, options: Partial<IQueryOptions> | void; }>({
      query: ({ onDate, options }) => {
        const params = queryOptionsToParamsString(options);
        return `expected-receipts-dev/${onDate[0]?.getTime()}-${onDate[1]?.getTime()}${params ? `?${params}` : ''}`;
      },
      transformResponse: (res: IExpectedReceiptsDevRequestResult) => res.queries?.expectedReceiptsDev || [],
      keepUnusedDataFor: 0
    }),
    getExpenses: builder.query<IExpense[], { onDate: DateRange<Date>, options: Partial<IQueryOptions> | void; }>({
      query: ({ onDate, options }) => {
        const params = queryOptionsToParamsString(options);
        return `expenses/${onDate[0]?.getTime()}-${onDate[1]?.getTime()}${params ? `?${params}` : ''}`;
      },
      transformResponse: (res: IExpensesRequestResult) => res.queries?.expenses || [],
      keepUnusedDataFor: 0
    }),
    getRemainsInvoices: builder.query<any[], { onDate: Date; }>({
      query: ({ onDate }) => `remains-by-invoices/${onDate.getTime()}`,
      transformResponse: (res: IRemainInvoicesRequestResult) => res.queries?.remainInvoices || [],
    }),
    getReconciliationStatement: builder.query<IReconciliationStatementRequestResult, { custId: number, dateBegin: Date, dateEnd: Date; }>({
      query: ({ custId, dateBegin, dateEnd }) => `reconciliation-statement/${dateBegin.getTime()}-${dateEnd.getTime()}?custId=${custId}`
    }),
    getTopEarning: builder.mutation<any[], Partial<any>>({
      query: (body) => ({
        url: 'topEarning',
        method: 'POST',
        body
      }),
      transformResponse: (res: ITopEarningRequestResult) => res.queries?.topEarning || [],
    }),
    getDebts: builder.query<IDebt[], { onDate: DateRange<Date>, options: Partial<IQueryOptions> | void; }>({
      query: ({ onDate, options }) => {
        const params = queryOptionsToParamsString(options);
        return `debts/${onDate[0]?.getTime()}-${onDate[1]?.getTime()}${params ? `?${params}` : ''}`;
      },
      transformResponse: (res: IDebtRequestResult) => res.queries?.debts || [],
      keepUnusedDataFor: 0
    }),
    getRevenue: builder.query<IRevenue[], { onDate: DateRange<Date>, options: Partial<IQueryOptions> | void; }>({
      query: ({ onDate, options }) => {
        const params = queryOptionsToParamsString(options);
        return `revenue/${onDate[0]?.getTime()}-${onDate[1]?.getTime()}${params ? `?${params}` : ''}`;
      },
      transformResponse: (res: IRevenueRequestResult) => res.queries?.revenue || [],
      keepUnusedDataFor: 0
    }),
  }),
});

export const {
  useGetExpectedReceiptsQuery,
  useGetExpectedReceiptsDevQuery,
  useGetExpensesQuery,
  useGetRemainsInvoicesQuery,
  useGetReconciliationStatementQuery,
  useGetTopEarningMutation: useGetTopEarningQuery,
  useGetDebtsQuery,
  useGetRevenueQuery
} = reportsApi;
