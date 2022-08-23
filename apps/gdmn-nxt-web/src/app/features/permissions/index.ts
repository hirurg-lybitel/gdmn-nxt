import { IPermissionsAction, IPermissionsView, IRequestResult, IUserGroup } from '@gsbelarus/util-api-types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrlApi } from '../../const';

type MatrixResponse = IPermissionsView[];
type IMatrixRequestResult = IRequestResult<{ cross: IPermissionsView[]}>;

type ActionsResponse = IPermissionsAction[];
type IActionsRequestResult = IRequestResult<{ actions: IPermissionsAction[]}>;

type UserGroupsResponse = IUserGroup[];
type IUserGroupsRequestResult = IRequestResult<{ userGroups: IUserGroup[]}>;

export const permissionsApi = createApi({
  reducerPath: 'permissions',
  tagTypes: ['Matrix', 'Actions', 'UserGroups'],
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
    })
  })

});

export const {
  useGetMatrixQuery,
  useGetActionsQuery,
  useGetUserGroupsQuery,
  useUpdateMatrixMutation
} = permissionsApi;
