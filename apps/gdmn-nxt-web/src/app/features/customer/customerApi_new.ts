import { ICustomer, IRequestResult } from '@gsbelarus/util-api-types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrlApi } from '../../const';

export interface ICustomers {
  contacts: ICustomer[];
};

export type ICustomersRequestResult = IRequestResult<ICustomers>;

export const customerApi = createApi({
  reducerPath: 'customer',
  tagTypes: ['Customers'],
  baseQuery: fetchBaseQuery({ baseUrl: baseUrlApi, credentials: 'include' }),
  endpoints: (builder) => ({
    getCustomers: builder.query<ICustomer[], void>({
      query: () => 'contacts',
      onQueryStarted() {
        console.info('⏩ request', 'GET', `${baseUrlApi}contacts_new`);
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
        // console.log('result', result);
        // result?.queries.contacts.map(({ ID }) => console.log('result_id', ID));
        // return [{ type: 'Customers', id: 'LIST' }];
        return (
          result
            ? [
              ...result.queries.contacts.map(({ ID }) => ({ type: 'Customers' as const, ID })),
              { type: 'Customers', id: 'LIST' },
            ]
            : error
              ? [{ type: 'Customers', id: 'ERROR' }]
              : [{ type: 'Customers', id: 'LIST' }]
        )
      }

    })
  }),
});

export const {
  useGetCustomersQuery,
  useUpdateCustomerMutation
} = customerApi;
