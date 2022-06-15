import { ICustomer, IRequestResult } from '@gsbelarus/util-api-types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { url } from 'inspector';
import { baseUrlApi } from '../../const';

export interface IPaginationData {
  pageNo: number;
  pageSize: number;
};
export interface IQueryOptions {
  pagination?: IPaginationData;
};

interface ICustomers {
  contacts: ICustomer[];
};

type ICustomersRequestResult = IRequestResult<ICustomers>;

export const customerApi = createApi({
  reducerPath: 'customer',
  tagTypes: ['Customers'],
  baseQuery: fetchBaseQuery({ baseUrl: baseUrlApi, credentials: 'include' }),
  endpoints: (builder) => ({
    getCustomers: builder.query<ICustomer[], Partial<IQueryOptions> | void>({
      query: (options) => 'contacts',
      onQueryStarted() {
        console.info('⏩ request', 'GET', `${baseUrlApi}contacts`);
      },
      transformResponse: (response: ICustomersRequestResult) => response.queries?.contacts || [],
      providesTags: (result, error) =>
        result
          ? [
            ...result.map(({ ID }) => ({ type: 'Customers' as const, ID })),
            { type: 'Customers', id: 'LIST' },
          ]
          : error
            ? [{ type: 'Customers', id: 'ERROR' }]
            : [{ type: 'Customers', id: 'LIST' }]
      // result
      //   ? [...result.map(({ ID }) => ({ type: 'Customers' as const, ID }))]
      //   : [{ type: 'Customers', id: 'LIST' }],
    }),
    updateCustomer: builder.mutation<ICustomersRequestResult, Partial<ICustomer>>({
      query(body) {
        const { ID: id } = body;
        return {
          url: `contacts/${id}`,
          method: 'PUT',
          body
        };
      },
      invalidatesTags: (result, error) => {
        console.log('result', result);
        // result?.queries.contacts.map(({ ID }) => console.log('result_id', ID));
        return [{ type: 'Customers', id: 350751947 }, { type: 'Customers', id: 'LIST' }];
        // return (
        //   result
        //     ? [
        //       ...result.queries.contacts.map(({ ID }) => ({ type: 'Customers' as const, ID })),
        //       { type: 'Customers', id: 'LIST' },
        //     ]
        //     : error
        //       ? [{ type: 'Customers', id: 'ERROR' }]
        //       : [{ type: 'Customers', id: 'LIST' }]
        // )
      },
      onQueryStarted() {
        console.info('⏩ request', 'PUT', `${baseUrlApi}contacts`);
      },

    }),
    addCustomer: builder.mutation<ICustomersRequestResult, Partial<ICustomer>>({
      query: (body) => ({
        url: 'contacts',
        method: 'POST',
        body
      }),
      invalidatesTags: (result, error) =>
        result
          ? [
            ...result.queries.contacts.map(({ ID }) => ({ type: 'Customers' as const, ID })),
            { type: 'Customers', id: 'LIST' },
          ]
          : error
            ? [{ type: 'Customers', id: 'ERROR' }]
            : [{ type: 'Customers', id: 'LIST' }]

    }),
    deleteCustomer: builder.mutation<{id: number}, number>({
      query: (id) => ({
        url: `contacts/${id}`,
        method: 'DELETE'
      }),
      onQueryStarted(id) {
        console.log('⏩ request', 'DELETE', `${baseUrlApi}constacts/${id}`);
      },
      invalidatesTags: (result, error, arg) => {
        console.log('result', result);
        console.log('arg', arg);

        return [{ type: 'Customers', id: 'LIST' }];
      }
    })
  }),
});

export const {
  useGetCustomersQuery,
  useUpdateCustomerMutation,
  useAddCustomerMutation,
  useDeleteCustomerMutation
} = customerApi;
