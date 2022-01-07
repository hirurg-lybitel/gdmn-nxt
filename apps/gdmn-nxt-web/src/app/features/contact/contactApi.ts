import { IBaseContact, IRequestResult, IWithID } from '@gsbelarus/util-api-types';
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
  }),
});

export const { useGetAllContactsQuery, useGetContactByTaxIdQuery } = contactApi;
