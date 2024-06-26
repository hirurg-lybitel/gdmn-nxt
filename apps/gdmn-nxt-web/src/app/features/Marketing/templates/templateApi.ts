import { baseUrlApi } from '@gdmn/constants/client';
import { IPaginationData, IQueryOptions, IRequestResult, ITemplate, queryOptionsToParamsString } from '@gsbelarus/util-api-types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';


export type ITemplateRequestResult = IRequestResult<{templates: ITemplate[], count: number}>;

export const templateApi = createApi({
  reducerPath: 'template',
  tagTypes: ['template'],
  baseQuery: fetchBaseQuery({ baseUrl: baseUrlApi + 'marketing/', credentials: 'include' }),
  endpoints: (builder) => ({
    getAllTemplate: builder.query<{templates: ITemplate[], count: number}, Partial<IQueryOptions> | void>({
      query: (options) => {
        const params = queryOptionsToParamsString(options);

        return {
          url: `templates${params ? `?${params}` : ''}`,
          method: 'GET'
        };
      },
      transformResponse: (response: ITemplateRequestResult) => {
        if (!response.queries?.templates) {
          return {
            count: 0,
            templates: []
          };
        }
        return {
          count: response.queries.count || 0,
          templates: response.queries?.templates
        };
      },
      providesTags: result => ['template']
    }),
    getTemplateById: builder.query<ITemplate, number>({
      query: (id) => `templates/${id}`,
      transformResponse: (response: IRequestResult<{templates: ITemplate[]}>) => response.queries?.templates[0],
    }),
    addTemplate: builder.mutation<ITemplateRequestResult, ITemplate>({
      query: (body) => ({
        url: 'templates',
        body: body,
        method: 'POST'
      }),
      invalidatesTags: ['template']
    }),
    updateTemplate: builder.mutation<ITemplateRequestResult, [ITemplate, number]>({
      query: ([body, id]) => ({
        url: `templates/${id}`,
        body: body,
        method: 'PUT'
      }),
      invalidatesTags: ['template']
    }),
    deleteTemplate: builder.mutation<ITemplateRequestResult, number>({
      query: (id) => ({
        url: `templates/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['template']
    })
  }),
});

export const {
  useGetAllTemplateQuery,
  useGetTemplateByIdQuery,
  useAddTemplateMutation,
  useDeleteTemplateMutation,
  useUpdateTemplateMutation,
} = templateApi;
