import { baseUrlApi } from '@gdmn/constants/client';
import { IAccount, IRequestResult, IWithID } from '@gsbelarus/util-api-types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

type IAccountWithID = IAccount & IWithID;

export interface IAccounts {
  accounts: IAccountWithID[];
};

export type IAccountRequestResult = IRequestResult<IAccounts>;

export const accountApi = createApi({
  reducerPath: 'account',
  baseQuery: fetchBaseQuery({ baseUrl: baseUrlApi, credentials: 'include' }),
  tagTypes: ['Accounts'],
  endpoints: (builder) => ({
    getAllAccounts: builder.query<IAccountRequestResult, void>({
      query: () => `accounts`,
      providesTags: ['Accounts']
    }),
    getAccountByEmail: builder.query<IAccountRequestResult, { email: string }>({
      query: ({ email }) => `accounts/email/${email}`,
      providesTags: ['Accounts']
    }),
    getAccount: builder.query<IAccountRequestResult, number>({
      query: (ID) => `account/${ID}`,
      providesTags: ['Accounts']
    }),
    addAccount: builder.mutation<IAccountRequestResult, Partial<IAccountWithID>>({
      query(body) {
        return {
          url: `account`,
          method: 'POST',
          body,
        }
      },
      // Invalidates all Post-type queries providing the `LIST` id - after all, depending of the sort order,
      // that newly created post could show up in any lists.
      invalidatesTags: ['Accounts']
    }),
    updateAccount: builder.mutation<IAccountRequestResult, Partial<IAccountWithID>>({
      query(data) {
        const { ID, ...body } = data;
        return {
          url: `account/${ID}`,
          method: 'PUT',
          body,
        }
      },
      // Invalidates all queries that subscribe to this Post `id` only.
      // In this case, `getPost` will be re-run. `getPosts` *might*  rerun, if this id was under its results.
      invalidatesTags: ['Accounts']
    }),
    deleteAccount: builder.mutation<{ success: boolean; id: number }, number>({
      query(ID) {
        return {
          url: `account/${ID}`,
          method: 'DELETE',
        }
      },
      // Invalidates all queries that subscribe to this Post `id` only.
      invalidatesTags: ['Accounts'],
    }),
  }),
});

export const {
  useGetAllAccountsQuery,
  useGetAccountByEmailQuery,
  useAddAccountMutation,
  useGetAccountQuery,
  useUpdateAccountMutation,
  useDeleteAccountMutation } = accountApi;
