import { IContactHierarchy, IRequestResult } from '@gsbelarus/util-api-types';
import { createApi } from '@reduxjs/toolkit/dist/query/react';
import { baseQueryByUserType } from '@gdmn-nxt/store/baseUrl';

interface IGroups {
  groups: IContactHierarchy[];
};

type IContactGroupsRequestResult = IRequestResult<IGroups>;

export const contactGroupApi = createApi({
  reducerPath: 'contactGroup',
  tagTypes: ['Groups'],
  baseQuery: baseQueryByUserType({ credentials: 'include' }),
  endpoints: (builder) => ({
    getGroups: builder.query<IContactHierarchy[], void>({
      query: () => 'contactgroups',
      transformResponse: (response: IContactGroupsRequestResult) => response.queries?.groups || [],
      providesTags: (result, error) =>
        result
          ? [
            ...result.map(({ ID }) => ({ type: 'Groups' as const, ID })),
            { type: 'Groups', id: 'LIST' },
          ]
          : error
            ? [{ type: 'Groups', id: 'ERROR' }]
            : [{ type: 'Groups', id: 'LIST' }]

    }),
    updateGroup: builder.mutation<IContactGroupsRequestResult, Partial<IContactHierarchy>>({
      query(body) {
        const { ID: id } = body;
        return {
          url: `contactgroups/${id}`,
          method: 'PUT',
          body: body
        };
      },
      invalidatesTags: (result, error) =>
        result
          ? [
            ...result.queries.groups.map(({ ID }) => ({ type: 'Groups' as const, ID })),
            { type: 'Groups', id: 'LIST' },
          ]
          : error
            ? [{ type: 'Groups', id: 'ERROR' }]
            : [{ type: 'Groups', id: 'LIST' }]
    }),
    addGroup: builder.mutation<IContactHierarchy[], Partial<IContactHierarchy>>({
      query(body) {
        return {
          url: 'contactgroups',
          method: 'POST',
          body: body
        };
      },
      transformResponse: (response: IContactGroupsRequestResult) => response.queries.groups,
      invalidatesTags: (result) =>
        result
          ? [
            ...result.map(({ ID }) => ({ type: 'Groups' as const, ID })),
            { type: 'Groups', id: 'LIST' },
          ]
          : [{ type: 'Groups', id: 'LIST' }],
    }),
    deleteGroup: builder.mutation<{ id: number; }, number>({
      query(id) {
        return {
          url: `contactgroups/${id}`,
          method: 'DELETE'
        };
      },
      invalidatesTags: (result) => {
        const id = result?.id;
        return (
          result
            ? [
              { type: 'Groups' as const, id: id },
              { type: 'Groups', id: 'LIST' },
            ]
            : [{ type: 'Groups', id: 'LIST' }]
        );
      }
    })
  })
});

export const { useGetGroupsQuery, useUpdateGroupMutation, useAddGroupMutation, useDeleteGroupMutation } = contactGroupApi;
