import { IERModel } from '@gsbelarus/util-api-types';
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryByUserType } from '@gdmn-nxt/store/baseUrl';

export const erModelApi = createApi({
  reducerPath: 'erModel',
  baseQuery: baseQueryByUserType({ credentials: 'include' }),
  endpoints: (builder) => ({
    getErModel: builder.query<IERModel, void>({
      query: () => 'er-model'
    }),
  }),
});

export const { useGetErModelQuery, useLazyGetErModelQuery } = erModelApi;
