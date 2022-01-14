import { IBaseContact, IRequestResult, IWithID, IContactWithID } from '@gsbelarus/util-api-types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrl } from '../../const';

export interface IContacts {
  contacts: (IBaseContact & IWithID)[];
};

export type IContactRequestResult = IRequestResult<IContacts>;

export const contactApi = createApi({
  reducerPath: 'contact',
  baseQuery: fetchBaseQuery({ baseUrl }),
  endpoints: (builder) => ({
    getAllContacts: builder.query<IContactRequestResult, void>({
      query: () => `contacts`
    }),
    getContactByTaxId: builder.query<IContactRequestResult, { taxId: string }>({
      query: ({ taxId }) => `contacts/taxId/${taxId}`
    }),
    updateContact: builder.mutation<any, IContactWithID>({
      query: (contact) => ({
        url: `contacts/161863497`,
        method: 'PUT',
        body: { ID: "161863497", NAME: "TEST", PHONE: "TEL" }
      }),
      transformResponse: (response: { data: any }, meta, arg) => {
        console.log('update_transform', response);
        return response.data
      },
      onQueryStarted: ((arg, { dispatch, getState, queryFulfilled, requestId, extra, getCacheEntry }) => console.log('update')),
      onCacheEntryAdded(arg, { dispatch, getState, extra, requestId, cacheEntryRemoved, cacheDataLoaded, getCacheEntry }) {console.log('update_cache')},
      invalidatesTags: (result, error, arg ) => {
        console.log('invalidatesTags', result, error);
        return [];
      },
    })
  }),
});

export const { useGetAllContactsQuery, useGetContactByTaxIdQuery, useUpdateContactMutation } = contactApi;
