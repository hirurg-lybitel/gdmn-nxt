import { IERModel } from '@gsbelarus/util-api-types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrlApi } from '@gdmn/constants/client';

export const erModelApi = createApi({
  reducerPath: 'erModel',
  baseQuery: fetchBaseQuery({ baseUrl: baseUrlApi, credentials: 'include' }),
  endpoints: (builder) => ({
    getErModel: builder.query<IERModel, void>({
      query: () => `er-model`
    }),
  }),
});

export const { useGetErModelQuery, useLazyGetErModelQuery } = erModelApi;
