import { IBaseContact, IRequestResult, IWithID, IContactWithID, IContactPerson } from '@gsbelarus/util-api-types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrlApi } from '../../const';

export interface IContacts {
  contacts: (IBaseContact & IWithID)[];
};

export type IContactRequestResult = IRequestResult<IContacts>;

export interface IPersons {
  persons: IContactPerson[];
};

export type IContactPersonsRequestResult = IRequestResult<IPersons>;

export const contactApi = createApi({
  reducerPath: 'contact',
  tagTypes: ['Persons'],
  baseQuery: fetchBaseQuery({ baseUrl: baseUrlApi, credentials: 'include' }),
  endpoints: (builder) => ({
    getAllContacts: builder.query<IContactRequestResult, void>({
      query: () => 'contacts'
    }),
    getContactByTaxId: builder.query<IContactRequestResult, { taxId: string }>({
      query: ({ taxId }) => `contacts/taxId/${taxId}`
    }),
    getContactPersons: builder.query<IContactPerson[], {customerId?: number, personId?: number}>({
      query: ({ customerId, personId }) => {
        let urlString;
        if (customerId) {
          urlString = `customerId/${customerId}`;
        };

        if (personId) {
          urlString = `${personId}`;
        };

        return {
          url: `contacts/persons/${urlString}`,
          method: 'GET'
        };
      },
      transformResponse: (response: IContactPersonsRequestResult) => response.queries?.persons || [],
      providesTags: (result, error) => {
        return (
          result
            ? [...result.map(({ ID }) => ({ type: 'Persons' as const, ID })), { type: 'Persons', id: 'LIST' }]
            // [
            //   ...result.map(({ ID }) => ({ type: 'Persons' as const, ID })),
            //   { type: 'Persons', id: 'LIST' },
            // ]
            : ['Persons']);
        // : error
        //   ? [{ type: 'Persons', id: 'ERROR' }]
        //   : [{ type: 'Persons', id: 'LIST' }]);
      }
    }),
    addContactPerson: builder.mutation<IContactPerson, Partial<IContactWithID>>({
      query: (body) => {
        return {
          url: 'contacts/persons',
          method: 'POST',
          body
        };
      },
      transformResponse: (response: IContactPersonsRequestResult) => response.queries?.persons[0] || null,
      invalidatesTags: ['Persons'],
    }),
    updateContactPerson: builder.mutation<IContactPerson, Partial<IContactWithID>>({
      query: (body) => ({
        url: `contacts/persons/${body.ID}`,
        method: 'PUT',
        body
      }),
      transformResponse: (response: IContactPersonsRequestResult) => response.queries.persons[0] || null,
      invalidatesTags: (result, error, arg) => {
        return result
          ? [{ type: 'Persons', id: arg.ID }, { type: 'Persons', id: 'LIST' }]
          : ['Persons'];
      }
    }),
    deleteContactPerson: builder.mutation<IContactWithID, number>({
      query: (id) => ({
        url: `contacts/persons/${id}`,
        method: 'DELETE'
      }),
      transformResponse: (response: IContactPersonsRequestResult) => response.queries.persons[0] || null,
      invalidatesTags: (result, error, arg) =>
        result
          ? [{ type: 'Persons', id: 'LIST' }]
          : error
            ? [{ type: 'Persons', id: 'ERROR' }]
            : [{ type: 'Persons', id: 'LIST' }]
    })
  }),
});

export const {
  useGetAllContactsQuery,
  useGetContactByTaxIdQuery,
  useGetContactPersonsQuery,
  useAddContactPersonMutation,
  useUpdateContactPersonMutation,
  useDeleteContactPersonMutation
} = contactApi;
