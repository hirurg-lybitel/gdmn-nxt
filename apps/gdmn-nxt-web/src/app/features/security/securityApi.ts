
import { IRequestResult, ISessionInfo } from '@gsbelarus/util-api-types';
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryByUserType } from '@gdmn-nxt/store/baseUrl';

interface ISessions {
  activeSessions: ISessionInfo[];
};

type ISessionsRequestResult = IRequestResult<ISessions>;

export const securityApi = createApi({
  reducerPath: 'security',
  baseQuery: baseQueryByUserType({ baseUrl: 'security', credentials: 'include' }),
  tagTypes: ['sessions'],
  endpoints: (builder) => ({
    getActiveSessions: builder.query<ISessionInfo[], void>({
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
} = securityApi;
