import { baseQueryByUserType } from '@gdmn-nxt/store/baseUrl';
import { IMailing, IMailingHistory, IQueryOptions, IRequestResult, MailAttachment, MailingStatus, queryOptionsToParamsString } from '@gsbelarus/util-api-types';
import { createApi } from '@reduxjs/toolkit/query/react';

export type IMailingRequestResult = IRequestResult<{ mailings: IMailing[], count: number; }>;

const cachedOptions: Partial<IQueryOptions>[] = [];

export const mailingApi = createApi({
  reducerPath: 'mailing',
  tagTypes: ['mailing'],
  baseQuery: baseQueryByUserType({ baseUrl: 'marketing/mailings', credentials: 'include' }),
  endpoints: (builder) => ({
    getAllMailing: builder.query<{ mailings: IMailing[], count: number; }, Partial<IQueryOptions> | void>({
      query: (options) => {
        const params = queryOptionsToParamsString(options);

        const lastOptions: Partial<IQueryOptions> = { ...options };

        if (!cachedOptions.some(item => JSON.stringify(item) === JSON.stringify(lastOptions))) {
          cachedOptions.push(lastOptions);
        }

        return {
          url: `${params ? `?${params}` : ''}`,
          method: 'GET'
        };
      },
      transformResponse: (response: IMailingRequestResult) => {
        if (!response.queries?.mailings) {
          return {
            count: 0,
            mailings: []
          };
        }
        return {
          count: response.queries.count,
          mailings: response.queries?.mailings
        };
      },
      providesTags: (result) =>
        result
          ? [
            ...result.mailings.map(({ ID }) => ({ type: 'mailing' as const, ID })),
            { type: 'mailing', id: 'LIST' },
          ]
          : [{ type: 'mailing', id: 'LIST' }],
    }),
    getMailingById: builder.query<IMailing, number>({
      query: (id) => `/${id}`,
      transformResponse: (response: IRequestResult<{ mailings: IMailing[]; }>) => response.queries?.mailings[0],
    }),
    addMailing: builder.mutation<IMailing, Partial<IMailing>>({
      query: (body) => ({
        url: '',
        body: body,
        method: 'POST'
      }),
      invalidatesTags: ['mailing']
    }),
    updateMailing: builder.mutation<IMailing, Partial<IMailing>>({
      query(data) {
        const { ID, ...body } = data;
        return {
          url: `/${ID}`,
          method: 'PUT',
          body,
        };
      },
      transformResponse: (response: IMailingRequestResult) => response.queries.mailings[0],
      invalidatesTags: (result, e, { ID }) =>
        result
          ? [{ type: 'mailing', id: ID }, { type: 'mailing', id: 'LIST' }]
          : [{ type: 'mailing', id: 'LIST' }],
      async onQueryStarted(newMailing, { dispatch, queryFulfilled }) {
        cachedOptions?.forEach(async opt => {
          const options = Object.keys(opt).length > 0 ? opt : undefined;
          const patchResult = dispatch(
            mailingApi.util.updateQueryData('getAllMailing', options, (draft) => {
              if (Array.isArray(draft?.mailings)) {
                const findIndex = draft.mailings?.findIndex(({ ID }) => ID === newMailing.ID);
                if (findIndex >= 0) {
                  draft.mailings[findIndex] = { ...draft.mailings[findIndex], ...newMailing };
                }
              }
            })
          );
          try {
            await queryFulfilled;
          } catch {
            patchResult.undo();
          }
        });
      },
    }),
    deleteMailing: builder.mutation<void, number>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['mailing']
    }),
    launchTestMailing: builder.mutation<any, { emails: string[], subject: string, template: string, attachments?: MailAttachment[]; }>({
      query: (body) => ({
        url: '/launch-test',
        body: body,
        method: 'POST'
      }),
    }),
    launchMailing: builder.mutation<any, number>({
      query: (id) => ({
        url: `/launch/${id}`,
        method: 'POST'
      }),
      invalidatesTags: (result, e, id) =>
        [{ type: 'mailing', id: 'LIST' }],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        cachedOptions?.forEach(async opt => {
          const options = Object.keys(opt).length > 0 ? opt : undefined;
          const patchResult = dispatch(
            mailingApi.util.updateQueryData('getAllMailing', options, (draft) => {
              if (Array.isArray(draft?.mailings)) {
                const findIndex = draft.mailings?.findIndex(c => c.ID === id);
                if (findIndex >= 0) {
                  draft.mailings[findIndex] = { ...draft.mailings[findIndex], STATUS: MailingStatus.inProgress };
                }
              }
            })
          );
          try {
            await queryFulfilled;
          } catch {
            patchResult.undo();
          }
        });
      },
    }),
    getMailingHistory: builder.query<{ history: IMailingHistory[], count: number; }, Partial<IQueryOptions> | void>({
      query: (options) => {
        const mailingId = options?.filter?.mailingId ?? -1;

        const params = queryOptionsToParamsString(options);

        const lastOptions: Partial<IQueryOptions> = { ...options };

        if (!cachedOptions.some(item => JSON.stringify(item) === JSON.stringify(lastOptions))) {
          cachedOptions.push(lastOptions);
        }

        return {
          url: `/history/${mailingId}${params ? `?${params}` : ''}`,
          method: 'GET'
        };
      },
      transformResponse: (response: IRequestResult<{ history: IMailingHistory[], count: number; }>) => {
        if (!response.queries?.history) {
          return {
            count: 0,
            history: []
          };
        }
        return {
          count: response.queries.count,
          history: response.queries?.history
        };
      },
    })
  }),
});

export const {
  useGetAllMailingQuery,
  useGetMailingByIdQuery,
  useAddMailingMutation,
  useDeleteMailingMutation,
  useUpdateMailingMutation,
  useLaunchMailingMutation,
  useLaunchTestMailingMutation,
  useGetMailingHistoryQuery
} = mailingApi;
