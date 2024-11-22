
import { IRequestResult, ISession } from '@gsbelarus/util-api-types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrlApi } from '@gdmn/constants/client';

interface ISessions{
  activeSessions: ISession[];
};

type ISessionsRequestResult = IRequestResult<ISessions>

export const sacurityApi = createApi({
  reducerPath: 'security',
  baseQuery: fetchBaseQuery({ baseUrl: baseUrlApi + 'security', credentials: 'include' }),
  tagTypes: ['sessions'],
  endpoints: (builder) => ({
    getActiveSessions: builder.query<ISession[], void>({
      query: () => '/active-sessions',
      transformResponse: (response: ISessionsRequestResult) => response.queries?.activeSessions || [],
      providesTags: ['sessions']
    }),
    closeSessionBySessionId: builder.mutation<void, string>({
      query: (id) => {
        return {
          url: `/closeSessionBySessionId/${id}`,
          method: 'POST',
        };
      }
      ,
      invalidatesTags: ['sessions'],
    }),
  })
});

export const {
  useGetActiveSessionsQuery,
  useCloseSessionBySessionIdMutation
} = sacurityApi;
