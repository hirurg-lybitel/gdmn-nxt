import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/dist/query/react";

interface INLPResult {
  version: '1.0';
  engine: string;
  models: string[];
  detectedLanguage: string;
  tokens: string[];
};

interface INLPQuery {
  version: '1.0';
  session: string;
  language?: string;
  text: string;
};

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
