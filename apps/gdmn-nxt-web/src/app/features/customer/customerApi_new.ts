import { ICustomer, ICustomerCross, ICustomerTickets, IFavoriteContact, IQueryOptions, IRequestResult, queryOptionsToParamsString } from '@gsbelarus/util-api-types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrlApi } from '@gdmn/constants/client';

export interface ISortingData {
  field: string;
  sort: 'asc' | 'desc' | null | undefined;
};

export interface IPaginationData {
  pageNo: number;
  pageSize: number;
};
interface ICustomers {
  contacts: ICustomer[];
};

type ICustomersRequestResult = IRequestResult<ICustomers>;
type ICustomersWithCountRequestResult = IRequestResult<{ contacts: ICustomer[], rowCount: any; }>;
type ICustomerRequestResult = IRequestResult<{ contact: ICustomer; }>;
type ICustomersCrossRequestResult = IRequestResult<{ cross: ICustomerCross[]; }>;

let lastOptions: Partial<IQueryOptions>;
const cachedOptions: Partial<IQueryOptions>[] = [];

export const customerApi = createApi({
  reducerPath: 'customer',
  tagTypes: ['Customers'],
  baseQuery: fetchBaseQuery({ baseUrl: baseUrlApi, credentials: 'include' }),
  endpoints: (builder) => ({
    getCustomer: builder.query<ICustomer, { customerId: number; }>({
      query({ customerId }) {
        return {
          url: `contacts/customerId/${customerId}`,
          method: 'GET'
        };
      },
      transformResponse: (response: ICustomersRequestResult) => response.queries.contacts[0]
    }),
    getCustomers: builder.query<{ data: ICustomer[], count?: number; }, Partial<IQueryOptions> | void>({
      query(options) {
        lastOptions = { ...options };

        // const lastOptions: Partial<IQueryOptions> = { ...options };

        if (!cachedOptions.some(item => JSON.stringify(item) === JSON.stringify(lastOptions))) {
          cachedOptions.push(lastOptions);
        }

        const params = queryOptionsToParamsString(options);

        return {
          url: `contacts${params ? `?${params}` : ''}`,
          method: 'GET',
        };
      },
      transformResponse: (response: ICustomersWithCountRequestResult) => ({ data: response.queries?.contacts || [], count: response.queries?.rowCount || 0 }),
      providesTags: (result, error) =>
        result?.data
          ? [
            ...result.data.map(({ ID }) => ({ type: 'Customers' as const, id: ID })),
            { type: 'Customers', id: 'LIST' },
          ]
          : error
            ? [{ type: 'Customers', id: 'ERROR' }]
            : [{ type: 'Customers', id: 'LIST' }]
    }),
    updateCustomer: builder.mutation<ICustomer, Partial<ICustomer> & Pick<ICustomer, 'ID' | 'NAME'>>({
      query(body) {
        const { ID: id } = body;
        return {
          url: `contacts/${id}`,
          method: 'PUT',
          body
        };
      },
      transformResponse: (response: ICustomerRequestResult) => response.queries?.contact,
      async onQueryStarted(newCustomer, { dispatch, queryFulfilled }) {
        cachedOptions?.forEach(async opt => {
          const options = Object.keys(opt).length > 0 ? opt : undefined;
          const patchResult = dispatch(
            customerApi.util.updateQueryData('getCustomers', options, (draft) => {
              if (Array.isArray(draft?.data)) {
                const findIndex = draft.data?.findIndex(c => c.ID === newCustomer.ID);
                if (findIndex >= 0) {
                  draft.data[findIndex] = { ...draft.data[findIndex], ...newCustomer };
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
    addCustomer: builder.mutation<ICustomer, Partial<ICustomer>>({
      query: (body) => ({
        url: 'contacts',
        method: 'POST',
        body
      }),
      transformResponse: (response: ICustomerRequestResult) => response.queries?.contact,
      async onQueryStarted({ ID, ...patch }, { dispatch, queryFulfilled }) {
        try {
          const { data: addedCustomer } = await queryFulfilled;
          const options = Object.keys(lastOptions).length > 0 ? lastOptions : undefined;
          dispatch(
            customerApi.util.updateQueryData('getCustomers', options, (draft) => {
              draft.data.unshift(addedCustomer);
              if (draft.count) draft.count += 1;
            })
          );
        } catch (error) {
          console.error('[ error ]', error);
        }
      },
    }),
    deleteCustomer: builder.mutation<{ id: number; }, number>({
      query: (id) => ({
        url: `contacts/${id}`,
        method: 'DELETE'
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        cachedOptions?.forEach(async opt => {
          const options = Object.keys(opt).length > 0 ? opt : undefined;
          const deleteResult = dispatch(
            customerApi.util.updateQueryData('getCustomers', options, (draft) => {
              if (Array.isArray(draft?.data)) {
                const findIndex = draft?.data.findIndex(d => d.ID === id);

                if (findIndex >= 0) {
                  draft?.data.splice(findIndex, 1);
                  if (draft.count) draft.count -= 1;
                }
              }
            })
          );
          try {
            await queryFulfilled;
          } catch (error) {
            deleteResult.undo();
          }
        });
      },
    }),
    getCustomersCross: builder.query<ICustomerCross, void>({
      query() {
        return {
          url: 'contacts/customerscross',
          method: 'GET'
        };
      },
      transformResponse: (response: ICustomersCrossRequestResult) => response.queries.cross[0] || [],
    }),
    addFavorite: builder.mutation<IFavoriteContact, number>({
      query: (contactID) => ({
        url: `contacts/favorites/${contactID}`,
        method: 'POST'
      }),
      // invalidatesTags: [{ type: 'Customers', id: 'LIST' }],
      async onQueryStarted(contactID, { dispatch, queryFulfilled }) {
        cachedOptions?.forEach(async opt => {
          const options = Object.keys(opt).length > 0 ? opt : undefined;
          const patchResult = dispatch(
            customerApi.util.updateQueryData('getCustomers', options, (draft) => {
              if (Array.isArray(draft?.data)) {
                const findIndex = draft?.data?.findIndex(c => c.ID === contactID);
                if (findIndex >= 0) {
                  draft.data[findIndex] = { ...draft.data[findIndex], isFavorite: true };
                  draft.data.sort((a, b) => a.isFavorite ? -1 : 1);
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
    deleteFavorite: builder.mutation<IFavoriteContact, number>({
      query: (contactID) => ({
        url: `contacts/favorites/${contactID}`,
        method: 'DELETE',
      }),
      // invalidatesTags: [{ type: 'Customers', id: 'LIST' }],
      async onQueryStarted(contactID, { dispatch, queryFulfilled }) {
        cachedOptions?.forEach(async opt => {
          const options = Object.keys(opt).length > 0 ? opt : undefined;
          const patchResult = dispatch(
            customerApi.util.updateQueryData('getCustomers', options, (draft) => {
              if (Array.isArray(draft?.data)) {
                const findIndex = draft?.data?.findIndex(c => c.ID === contactID);
                if (findIndex >= 0) {
                  draft.data[findIndex] = { ...draft.data[findIndex], isFavorite: false };
                  draft.data.sort((a, b) => a.isFavorite ? -1 : 1);
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
    addCustomerTickets: builder.mutation<ICustomerTickets, ICustomerTickets>({
      query: (body) => ({
        url: 'contacts/tickets',
        body,
        method: 'POST'
      }),
      async onQueryStarted(body, { dispatch, queryFulfilled }) {
        cachedOptions?.forEach(async opt => {
          const options = Object.keys(opt).length > 0 ? opt : undefined;
          const patchResult = dispatch(
            customerApi.util.updateQueryData('getCustomers', options, (draft) => {
              if (Array.isArray(draft?.data)) {
                const findIndex = draft?.data?.findIndex(c => c.ID === body.customer?.ID);
                if (findIndex >= 0) {
                  draft.data[findIndex] = { ...draft.data[findIndex], ticketSystem: true };
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
      invalidatesTags: [{ type: 'Customers', id: 'LIST' }]
    }),
    updateTicketsCustomer: builder.mutation<ICustomerTickets, ICustomer>({
      query: (body) => ({
        url: `contacts/tickets/${body.ID}`,
        body,
        method: 'PUT'
      }),
      async onQueryStarted(body, { dispatch, queryFulfilled }) {
        cachedOptions?.forEach(async opt => {
          const options = Object.keys(opt).length > 0 ? opt : undefined;
          const patchResult = dispatch(
            customerApi.util.updateQueryData('getCustomers', options, (draft) => {
              if (Array.isArray(draft?.data)) {
                const findIndex = draft?.data?.findIndex(c => c.ID === body.ID);
                if (findIndex >= 0) {
                  draft.data[findIndex] = { ...draft.data[findIndex], performer: body.performer };
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
      invalidatesTags: [{ type: 'Customers', id: 'LIST' }]
    }),
    deleteCustomerTickets: builder.mutation<void, number>({
      query: (contactID) => ({
        url: `contacts/tickets/${contactID}`,
        method: 'DELETE',
      }),
      async onQueryStarted(contactID, { dispatch, queryFulfilled }) {
        cachedOptions?.forEach(async opt => {
          const options = Object.keys(opt).length > 0 ? opt : undefined;
          const patchResult = dispatch(
            customerApi.util.updateQueryData('getCustomers', options, (draft) => {
              if (Array.isArray(draft?.data)) {
                const findIndex = draft?.data?.findIndex(c => c.ID === contactID);
                if (findIndex >= 0) {
                  draft.data[findIndex] = { ...draft.data[findIndex], ticketSystem: false };
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
      invalidatesTags: [{ type: 'Customers', id: 'LIST' }]
    })
  }),
});

export const {
  useGetCustomerQuery,
  useGetCustomersQuery,
  useUpdateCustomerMutation,
  useAddCustomerMutation,
  useDeleteCustomerMutation,
  useGetCustomersCrossQuery,
  useAddFavoriteMutation,
  useDeleteFavoriteMutation,
  useAddCustomerTicketsMutation,
  useDeleteCustomerTicketsMutation,
  useUpdateTicketsCustomerMutation
} = customerApi;
