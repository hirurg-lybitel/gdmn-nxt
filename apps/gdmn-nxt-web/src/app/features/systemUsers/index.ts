import { IUser, IRequestResult, IChangePassword, IAuthResult } from '@gsbelarus/util-api-types';
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryByUserType } from '@gdmn-nxt/store/baseUrl';

type IUsersRequestResult = IRequestResult<{ users: IUser[]; }>;

type IUserRequestResult = IRequestResult<{ user: IUser; }>;

export const systemUsers = createApi({
  reducerPath: 'systemUsers',
  tagTypes: ['Users'],
  baseQuery: baseQueryByUserType({ credentials: 'include' }),
  endpoints: (builder) => ({
    getUsers: builder.query<IUser[], void>({
      query: () => 'system/users',
      transformResponse: (response: IUsersRequestResult) => response.queries?.users || [],
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ ID }) => ({ type: 'Users' as const, ID })),
            { type: 'Users', id: 'LIST' },
          ]
          : [{ type: 'Users', id: 'LIST' }],
    }),
    getUser: builder.query<IUser, number>({
      query: (id) => `system/user/${id}`,
      transformResponse: (response: IUserRequestResult) => response.queries?.user,
      providesTags: (result) =>
        result
          ? [{ type: 'Users', id: result?.ID }, { type: 'Users', id: 'LIST' }]
          : [{ type: 'Users', id: 'LIST' }],
    }),
    changePassword: builder.mutation<IAuthResult, IChangePassword>({
      query: (body) => ({
        url: 'user/change-password',
        body: body,
        method: 'POST'
      })
    }),
  })
});


export const {
  useGetUsersQuery,
  useGetUserQuery,
  useChangePasswordMutation
} = systemUsers;
