import { IAccount, IRequestResult, IWithID } from '@gsbelarus/util-api-types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrl } from '../../const';

type IAccountWithID = IAccount & IWithID;

export interface IAccounts {
  accounts: IAccountWithID[];
};

export type IAccountRequestResult = IRequestResult<IAccounts>;

export const accountApi = createApi({
  reducerPath: 'account',
  baseQuery: fetchBaseQuery({ baseUrl }),
  tagTypes: ['Accounts'],
  endpoints: (builder) => ({
    getAllAccounts: builder.query<IAccountRequestResult, void>({
      query: () => `accounts`,
      providesTags: (result) =>
        // is result available?
        result?.queries.accounts
          ? // successful query
            [
              ...result.queries.accounts.map(({ ID }) => ({ type: 'Accounts', ID } as const)),
              { type: 'Accounts', id: 'LIST' },
            ]
          : // an error occurred, but we still want to refetch this query when `{ type: 'Posts', id: 'LIST' }` is invalidated
            [{ type: 'Accounts', id: 'LIST' }],
    }),
    getAccountByEmail: builder.query<IAccountRequestResult, { email: string }>({
      query: ({ email }) => `accounts/email/${email}`,
      providesTags: (result) =>
        // is result available?
        result?.queries.accounts
          ? // successful query
            [
              ...result.queries.accounts.map(({ ID }) => ({ type: 'Accounts', ID } as const)),
              { type: 'Accounts', id: 'LIST' },
            ]
          : // an error occurred, but we still want to refetch this query when `{ type: 'Posts', id: 'LIST' }` is invalidated
            [{ type: 'Accounts', id: 'LIST' }],
    }),
    addAccount: builder.mutation<IAccountWithID, Partial<IAccountWithID>>({
      query(body) {
        return {
          url: `account`,
          method: 'POST',
          body,
        }
      },
      // Invalidates all Post-type queries providing the `LIST` id - after all, depending of the sort order,
      // that newly created post could show up in any lists.
      invalidatesTags: [{ type: 'Accounts', id: 'LIST' }],
    }),
    getAccount: builder.query<IAccountWithID, number>({
      query: (id) => `account/${id}`,
      providesTags: (result, error, id) => [{ type: 'Accounts', id }],
    }),
    updateAccount: builder.mutation<IAccountWithID, Partial<IAccountWithID>>({
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
      invalidatesTags: (result, error, { ID }) => [{ type: 'Accounts', ID }],
    }),
    deleteAccount: builder.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `account/${id}`,
          method: 'DELETE',
        }
      },
      // Invalidates all queries that subscribe to this Post `id` only.
      invalidatesTags: (result, error, id) => [{ type: 'Accounts', id }],
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
