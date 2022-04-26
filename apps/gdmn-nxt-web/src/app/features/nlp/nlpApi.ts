import { INLPQuery, INLPResult } from "@gsbelarus/util-api-types";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/dist/query/react";

export const nlpQueryApi = createApi({
  reducerPath: 'nlpQuery',
  tagTypes: ['nlp'],
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8080'
  }),
  endpoints: (builder) => ({
    parseText: builder.query<INLPResult, INLPQuery>({
      query: (body) => ({
        url: '/api/nlp/v1/parse-text',
        method: 'POST',
        body
      }),
      providesTags: ['nlp']
    })
  })
});

export const { useParseTextQuery } = nlpQueryApi;
