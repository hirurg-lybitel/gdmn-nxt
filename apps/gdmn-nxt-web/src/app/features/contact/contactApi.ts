import { IBaseContact } from '@gsbelarus/util-api-types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrl } from '../../const';

export const contactApi = createApi({
  reducerPath: 'contact',
  baseQuery: fetchBaseQuery({ baseUrl }),
  endpoints: (builder) => ({
    getAllContacts: builder.query<IBaseContact[], void>({
      query: () => `contacts`,
    }),
  }),
});

export const { useGetAllContactsQuery } = contactApi;
