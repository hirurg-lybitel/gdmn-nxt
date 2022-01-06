import { IBaseContact, IWithID } from '@gsbelarus/util-api-types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrl } from '../../const';

type T = {
  contacts: (IBaseContact & IWithID)[];
  _schema: any;
}

export const contactApi = createApi({
  reducerPath: 'contact',
  baseQuery: fetchBaseQuery({ baseUrl }),
  endpoints: (builder) => ({
    getAllContacts: builder.query<T, void>({
      query: () => `contacts`
    }),
  }),
});

export const { useGetAllContactsQuery } = contactApi;
