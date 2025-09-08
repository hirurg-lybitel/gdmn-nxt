import { IActCompletion, IRequestResult } from '@gsbelarus/util-api-types';
import { createApi } from '@reduxjs/toolkit/dist/query/react';
import { baseQueryByUserType } from '@gdmn-nxt/store/baseUrl';

interface IActCompletions {
  actCompletion: IActCompletion[];
};

type IActCompletionRequestResult = IRequestResult<IActCompletions>;

export const actCompletionApi = createApi({
  reducerPath: 'actCompletion',
  tagTypes: ['Act'],
  baseQuery: baseQueryByUserType({ credentials: 'include' }),
  endpoints: (builder) => ({
    getActCompletion: builder.query<IActCompletion[], number | void>({
      query: (customerId) => `act-completion${customerId ? `/${customerId}` : ''}`,
      transformResponse: (response: IActCompletionRequestResult) => response.queries?.actCompletion.map(act => ({ ...act, DOCUMENTDATE: new Date(act.DOCUMENTDATE) })) || [],
      providesTags: (result) =>
        result
          ? [...result.map(({ ID }) => ({ type: 'Act' as const, ID }))]
          : [{ type: 'Act', id: 'LIST' }],
    })
  })
});

export const { useGetActCompletionQuery } = actCompletionApi;
