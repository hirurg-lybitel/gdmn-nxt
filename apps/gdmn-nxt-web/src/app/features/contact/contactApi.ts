import { IBaseContact, IRequestResult, IWithID } from '@gsbelarus/util-api-types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrl } from '../../const';

export interface IContacts {
  contacts: (IBaseContact & IWithID)[];
};

export type IContactWithID = IBaseContact & IWithID;

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
    updateContact: builder.mutation<IContactWithID, void>({
      query: () => ({
        url: `contacts/161863497`,
        method: 'PUT',
        body: { ID: "161863497", NAME: "TEST", PHONE: "TEL" }
      }),
      transformResponse: (response: { data: IContactWithID }, meta, arg) => response.data,
      onQueryStarted: (()=> console.log('update'))
    })
    // update: builder.mutation<IContactWithID | any, IContactWithID>({
    //   query: (body) => ({
    //     url: `contacts/${body.ID}`,
    //     method: 'PUT',
    //     body: body
    //   }),
    //   transformResponse: (response: { data: IContactWithID }, meta, arg) => response.data,
    // })
  }),
});

export const { useGetAllContactsQuery, useGetContactByTaxIdQuery, useUpdateContactMutation } = contactApi;
