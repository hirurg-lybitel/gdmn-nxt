
import { IAuthResult } from '@gsbelarus/util-api-types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrlApi } from '@gdmn/constants/client';

export const authApi = createApi({
  reducerPath: 'auth',
  baseQuery: fetchBaseQuery({ baseUrl: baseUrlApi, credentials: 'include' }),
  endpoints: (builder) => ({
    disableOtp: builder.mutation<IAuthResult, { code: string }>({
      query: (body) => ({
        url: 'user/disable-2fa',
        method: 'POST',
        body
      }),
    }),
    getCreate2fa: builder.query<IAuthResult, void>({
      query: () => 'user/create-2fa'
    }),
    create2fa: builder.mutation<IAuthResult, { authCode: string, emailCode: string }>({
      query: (body) => ({
        url: 'user/create-2fa',
        method: 'POST',
        body
      }),
    }),
  })
});

export const {
  useDisableOtpMutation,
  useCreate2faMutation,
  useGetCreate2faQuery
} = authApi;
