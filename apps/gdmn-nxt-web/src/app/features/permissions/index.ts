import { IPermissionsAction, IPermissionsView, IRequestResult, IUser, IUserGroup } from '@gsbelarus/util-api-types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrlApi } from '../../const';

type MatrixResponse = IPermissionsView[];
type IMatrixRequestResult = IRequestResult<{ cross: IPermissionsView[]}>;

type ActionsResponse = IPermissionsAction[];
type IActionsRequestResult = IRequestResult<{ actions: IPermissionsAction[]}>;

type UserGroupsResponse = IUserGroup[];
type IUserGroupsRequestResult = IRequestResult<{ userGroups: IUserGroup[]}>;

type UsersResponse = IUser[];
type IUsersRequestResult = IRequestResult<{ users: IUser[]}>;

export const permissionsApi = createApi({
  reducerPath: 'permissions',
  tagTypes: ['Matrix', 'Actions', 'UserGroups', 'Users'],
  baseQuery: fetchBaseQuery({ baseUrl: baseUrlApi, credentials: 'include' }),
  endpoints: (builder) => ({
    getMatrix: builder.query<MatrixResponse, void>({
      query: () => 'permissions',
      transformResponse: (response: IMatrixRequestResult) => response.queries.cross || [],
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ ID }) => ({ type: 'Matrix' as const, ID })),
            { type: 'Matrix', id: 'LIST' }
          ]
          : [{ type: 'Matrix', id: 'LIST' }]
    }),
    getActions: builder.query<ActionsResponse, void>({
      query: () => 'permissions/actions',
      transformResponse: (response: IActionsRequestResult) => response.queries.actions || [],
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ ID }) => ({ type: 'Actions' as const, ID })),
            { type: 'Actions', id: 'LIST' }
          ]
          : [{ type: 'Actions', id: 'LIST' }]
    }),
    getUserGroups: builder.query<UserGroupsResponse, void>({
      query: () => 'permissions/usergroups',
      transformResponse: (response: IUserGroupsRequestResult) => response.queries.userGroups || [],
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ ID }) => ({ type: 'UserGroups' as const, ID })),
            { type: 'UserGroups', id: 'LIST' }
          ]
          : [{ type: 'UserGroups', id: 'LIST' }]
    }),
    updateMatrix: builder.mutation<IPermissionsView, Partial<IPermissionsView>>({
      query: (body) => ({
        url: 'permissions',
        method: 'PUT',
        body
      }),
      invalidatesTags: (result) =>
        result
          ? [{ type: 'Matrix', id: result?.ID }, { type: 'Matrix', id: 'LIST' }]
          : [{ type: 'Matrix', id: 'LIST' }]
    }),
    getUsersByGroup: builder.query<UsersResponse, number>({
      query: (groupID) => `permissions/userGroups/${groupID}/users`,
      transformResponse: (response: IUsersRequestResult) => response.queries.users || [],
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ ID }) => ({ type: 'Users' as const, ID })),
            { type: 'Users', id: 'LIST' }
          ]
          : [{ type: 'Users', id: 'LIST' }]

    })
  })

});

export const {
  useGetMatrixQuery,
  useGetActionsQuery,
  useGetUserGroupsQuery,
  useUpdateMatrixMutation,
  useGetUsersByGroupQuery
} = permissionsApi;
