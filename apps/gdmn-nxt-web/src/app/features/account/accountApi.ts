import { IAccount, IRequestResult, IWithID } from '@gsbelarus/util-api-types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrl } from '../../const';

export interface IAccounts {
  accounts: (IAccount & IWithID)[];
};

export type IAccountRequestResult = IRequestResult<IAccounts>;

export const accountApi = createApi({
  reducerPath: 'account',
  baseQuery: fetchBaseQuery({ baseUrl }),
  endpoints: (builder) => ({
    getAllAccounts: builder.query<IAccountRequestResult, void>({
      query: () => `accounts`
    }),
    getAccountByEmail: builder.query<IAccountRequestResult, { email: string }>({
      query: ({ email }) => `accounts/email/${email}`
    }),
  }),
});

export const { useGetAllAccountsQuery, useGetAccountByEmailQuery } = accountApi;
