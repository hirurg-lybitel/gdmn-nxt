import { IRequestResult, ILabelsContact } from '@gsbelarus/util-api-types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrlApi } from '../../const';

export interface ILabels {
  labels: ILabelsContact[];
};

export type ILabelsContactRequestResult = IRequestResult<ILabels>;

export const labelsApi = createApi({
  reducerPath: 'labels',
  tagTypes: ['labelsContact'],
  baseQuery: fetchBaseQuery({ baseUrl: baseUrlApi }),
  endpoints: (builder) => ({
    getLabelsContact: builder.query<ILabelsContactRequestResult, number | void>({
      query: (contactId?) => `contacts/labels${contactId ? `/${contactId}` : ``}`,
      transformResponse: (response: IRequestResult<ILabels>, meta, arg) => {
        // console.log('getLabelsContact_transform', response);
        // console.log('getLabelsContact_meta', meta);
        return response;
      },
      providesTags: (result, error) => {
        // console.log('getLabelsContact_providesTags_result', result);
        // console.log('getLabelsContact_providesTags_error', error);

        return result
          ? [
              ...result.queries.labels.map(({ID: id}) => ({ type: 'labelsContact' as const, id})),
              { type: 'labelsContact', id: 'LIST' }
            ]
          : [{ type: 'labelsContact', id: 'LIST' }]
      },
      async onQueryStarted(
        arg,
        {
          dispatch,
          getState,
          extra,
          requestId,
          queryFulfilled,
          getCacheEntry,
          updateCachedData,
        }
      ) {
        // console.log('getLabelsContact_onQueryStarted', arg);
        // console.log('getLabelsContact_onQueryStarted', getCacheEntry);
      },
      onCacheEntryAdded(arg, { dispatch, getState, extra, requestId, cacheEntryRemoved, cacheDataLoaded, getCacheEntry }) {
        // console.log('getLabelsContact_onCacheEntryAdded', arg);
        // console.log('getLabelsContact_onCacheEntryAdded', getCacheEntry);
      },
    }),
    addLabelsContact: builder.mutation<ILabelsContactRequestResult, ILabelsContact[]>({
      query: (labels) => ({
        url: `contacts/labels`,
        method: 'POST',
        body: labels
      }),
      transformResponse: (response: any) => {
        console.log('addLabelsContact_transformResponse', response);
        return response.data;
      },
      invalidatesTags: (result, error, id: any) => {
        console.log('addLabelsContact_invalidatesTags', result, error, id);

        return [{type: 'labelsContact', id: 'LIST'}];
      },
      onQueryStarted(id, { dispatch, getState, extra, requestId, queryFulfilled, getCacheEntry }) {
        console.log('addLabelsContact_onQueryStarted');
      },
      onCacheEntryAdded(id, { dispatch, getState, extra, requestId, cacheEntryRemoved, cacheDataLoaded, getCacheEntry }) {
        console.log('addLabelsContact_onCacheEntryAdded');
      }
    }),
    deleteLabelsContact: builder.mutation<{ success: boolean; id: number }, number>({
      query(contactId){
        return {
          url: `contacts/labels/${contactId}`,
          method: 'DELETE'
        }
      },
      invalidatesTags: ['labelsContact']

    })
  }),
});

export const { useGetLabelsContactQuery, useAddLabelsContactMutation, useDeleteLabelsContactMutation } = labelsApi;

