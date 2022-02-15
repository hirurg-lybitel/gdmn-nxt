import { IContactHierarchy, IRequestResult } from "@gsbelarus/util-api-types";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/dist/query/react";
import { baseUrlApi } from '../../const';

interface IGroups {
  groups: IContactHierarchy[];
};

type IContactGroupsRequestResult = IRequestResult<IGroups>;

export const contactGroupApi = createApi({
  reducerPath: 'contactGroup',
  tagTypes: ['Groups'],
  baseQuery: fetchBaseQuery({ baseUrl: baseUrlApi, credentials: 'include' }),
  endpoints: (builder) => ({
    getGroups: builder.query<IContactHierarchy[], void>({
      query: () => `contactgroups`,
      async onQueryStarted(){console.log('⏩ request', "GET", `${baseUrlApi}contactgroups`)},
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
      async onQueryStarted({ID:id}){console.log('⏩ request', "PUT", `${baseUrlApi}contactgroups/${id}`)},
      query(body) {
        const {ID:id} = body;
        return {
          url: `contactgroups/${id}`,
          method: 'PUT',
          body: body
        }
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
      async onQueryStarted(){console.log('⏩ request', "POST", `${baseUrlApi}contactgroups`)},
      query(body) {
        return {
          url: `contactgroups`,
          method: 'POST',
          body: body
        }
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
    deleteGroup: builder.mutation<{id: number}, number>({
      async onQueryStarted(id){console.log('⏩ request', "DELETE", `${baseUrlApi}contactgroups/${id}`)},
      query(id) {
        return {
          url: `contactgroups/${id}`,
          method: 'DELETE'
        }
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
          )
        }
    })
  })
});

export const { useGetGroupsQuery, useUpdateGroupMutation, useAddGroupMutation, useDeleteGroupMutation } = contactGroupApi;
