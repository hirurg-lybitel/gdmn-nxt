import { IRequestResult, IBusinessProcess } from '@gsbelarus/util-api-types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import { baseUrlApi } from '@gdmn/constants/client';

interface IBusinessProcesses{
  businessProcesses: IBusinessProcess[];
};

type IBusinessProcessesRequestResult = IRequestResult<IBusinessProcesses>;


export const businessProcessesApi = createApi({
  reducerPath: 'businessProcesses',
  tagTypes: ['businessProcess'],
  baseQuery: fetchBaseQuery({ baseUrl: baseUrlApi, credentials: 'include' }),
  endpoints: (builder) => ({
    getBusinessProcesses: builder.query<IBusinessProcess[], void >({
      query: () => 'business-processes',
      transformResponse: (response: IBusinessProcessesRequestResult) => response.queries?.businessProcesses || [],
      providesTags: (result, error) =>
        result
          ? [
            ...result.map(({ ID }) => ({ type: 'businessProcess' as const, ID })),
            { type: 'businessProcess', id: 'LIST' },
          ]
          : error
            ? [{ type: 'businessProcess', id: 'ERROR' }]
            : [{ type: 'businessProcess', id: 'LIST' }]
    }),
  })
});

export const { useGetBusinessProcessesQuery } = businessProcessesApi;
