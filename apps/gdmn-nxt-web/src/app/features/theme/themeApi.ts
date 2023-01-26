
import { IRequestResult } from '@gsbelarus/util-api-types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import { baseUrlApi } from '../../const';

export interface theme {
  ID: number,
  USR$ID: number,
  USR$MODE: string
}

export interface ITheme {
  USR$ID: number,
  USR$MODE: string
}

type IThemeRequestResult = IRequestResult<{mode: theme}>

export const themeApi = createApi({
  reducerPath: 'theme',
  baseQuery: fetchBaseQuery({ baseUrl: baseUrlApi, credentials: 'include' }),
  tagTypes: ['theme'],
  endpoints: (builder) => ({
    getTheme: builder.query<string, number | undefined>({
      query: (id) => {
        return {
          url: `theme/${id}`
        };
      },
      transformResponse: (response: IThemeRequestResult) => response.queries?.mode.USR$MODE,
      providesTags: result => ['theme']
    }),
    editTheme: builder.mutation<string, [ITheme, number]>({
      query: ([body, id]) => ({
        url: `theme/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['theme']
    }),
    addTheme: builder.mutation<string, [ITheme, number]>({
      query: ([body, userId]) => ({
        url: `theme/${userId}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['theme']
    }),
  })
});

export const {
  useGetThemeQuery,
  useEditThemeMutation,
  useAddThemeMutation
} = themeApi;
