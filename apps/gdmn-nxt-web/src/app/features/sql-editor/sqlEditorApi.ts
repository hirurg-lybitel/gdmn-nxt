import { IRequestResult, ISqlHistory } from '@gsbelarus/util-api-types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import { baseUrlApi } from '../../const';

interface IHistory{
  history: any[];
};

interface IResult{
  result: any[];
};

type IHistoryRequestResult = IRequestResult<IHistory>;
type IResultRequestResult = IRequestResult<IResult>;

export const sqlEditorApi = createApi({
  reducerPath: 'sqlEditor',
  baseQuery: fetchBaseQuery({ baseUrl: baseUrlApi, credentials: 'include' }),
  endpoints: builder => ({
    getHistory: builder.query<ISqlHistory[], void>({
      query: () => 'system/sql-editor/history',
      transformResponse: (response: IHistoryRequestResult) => response.queries?.history || [],
    }),
    executeScript: builder.mutation<any, any>({
      query: (body) => ({
        url: 'system/sql-editor',
        method: 'POST',
        body
      }),
      transformResponse: (response: IResultRequestResult) => response.queries.result || [],
    })
  })
});

export const { useGetHistoryQuery, useExecuteScriptMutation } = sqlEditorApi;
