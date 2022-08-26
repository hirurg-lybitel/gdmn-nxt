import { IPermissionsAction, IPermissionsView, IRequestResult, IUser, IUserGroup, IUserGroupLine } from '@gsbelarus/util-api-types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrlApi } from '../../const';

type MatrixResponse = IPermissionsView[];
type IMatrixRequestResult = IRequestResult<{ cross: IPermissionsView[]}>;

type ActionsResponse = IPermissionsAction[];
type IActionsRequestResult = IRequestResult<{ actions: IPermissionsAction[]}>;

type UserGroupsResponse = IUserGroup[];
type IUserGroupsRequestResult = IRequestResult<{ userGroups: IUserGroup[]}>;
type IUserGroupRequestResult = IRequestResult<{ userGroup: IUserGroup}>;

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
    addUserGroup: builder.mutation<IUserGroup, Partial<IUserGroup>>({
      query: (body) => ({
        url: 'permissions/usergroups',
        method: 'POST',
        body
      }),
      invalidatesTags: [{ type: 'UserGroups', id: 'LIST' }],
      transformResponse: (result: IUserGroupRequestResult) => result.queries.userGroup
    }),
    updateUserGroup: builder.mutation<IUserGroup, Partial<IUserGroup>>({
      query(data) {
        const { ID, ...body } = data;
        return {
          url: `permissions/userGroups/${ID}`,
          method: 'PUT',
          body
        };
      },
      invalidatesTags: (result) =>
        result
          ? [{ type: 'UserGroups', id: result?.ID }, { type: 'UserGroups', id: 'LIST' }]
          : [{ type: 'UserGroups', id: 'LIST' }],
    }),
    deleteUseGroup: builder.mutation<{ id: number}, number>({
      query: (id) => ({
        url: `permissions/usergroups${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: (result) =>
        result
          ? [{ type: 'UserGroups', id: result.id }, { type: 'UserGroups', id: 'LIST' }]
          : [{ type: 'UserGroups', id: 'LIST' }]
    }),
    addUserGroupLine: builder.mutation<IUserGroupLine, Partial<IUserGroupLine>>({
      query: (body) => ({
        url: 'permissions/usergroupsline',
        method: 'POST',
        body
      }),
      invalidatesTags: [{ type: 'Users', id: 'LIST' }]
    }),
    deleteUserGroupLine: builder.mutation<{ id: number }, number>({
      query: (id) => ({
        url: `permissions/usergroupsline/${id}`,
        method: 'METHOD'
      }),
    })
  })
});

export const {
  useGetMatrixQuery,
  useGetActionsQuery,
  useGetUserGroupsQuery,
  useUpdateMatrixMutation,
  useGetUsersByGroupQuery,
  useAddUserGroupLineMutation,
  useAddUserGroupMutation,
  useDeleteUseGroupMutation,
  useDeleteUserGroupLineMutation,
  useUpdateUserGroupMutation,
} = permissionsApi;
