import { ICustomerContract, IRequestResult } from '@gsbelarus/util-api-types';
import { createApi } from '@reduxjs/toolkit/dist/query/react';
import { baseQueryByUserType } from '@gdmn-nxt/store/baseUrl';

type ICustomerContractsRequestResult = IRequestResult<{ customerContracts: ICustomerContract[]; }>;

export const customerContractsApi = createApi({
  reducerPath: 'customerContracts',
  tagTypes: ['CustomerContracts'],
  baseQuery: baseQueryByUserType({ credentials: 'include' }),
  endpoints: (builder) => ({
    getCustomerContracts: builder.query<ICustomerContract[], number | void>({
      query: (id) => `customerContracts${id ? `/${id}` : ''}`,
      // async onQueryStarted(){console.log('⏩ request', "GET", `${baseUrlApi}customercontracts`)},
      transformResponse: (response: ICustomerContractsRequestResult) => response.queries?.customerContracts || [],
      providesTags: (result, error) =>
        result
          ? [
            ...result.map(({ ID }) => ({ type: 'CustomerContracts' as const, ID })),
            { type: 'CustomerContracts', id: 'LIST' },
          ]
          : error
            ? [{ type: 'CustomerContracts', id: 'ERROR' }]
            : [{ type: 'CustomerContracts', id: 'LIST' }]

    }),
    updateCustomerContract: builder.mutation<ICustomerContractsRequestResult, Partial<ICustomerContract>>({
      // async onQueryStarted({ID:id}){console.log('⏩ request', 'PUT', `${baseUrlApi}customerContracts/${id}`)},
      query(body) {
        const { ID: id } = body;
        return {
          url: `customerContracts/${id}`,
          method: 'PUT',
          body: body
        };
      },
      invalidatesTags: (result, error) =>
        result
          ? [
            ...result.queries.customerContracts.map(({ ID }) => ({ type: 'CustomerContracts' as const, ID })),
            { type: 'CustomerContracts', id: 'LIST' },
          ]
          : error
            ? [{ type: 'CustomerContracts', id: 'ERROR' }]
            : [{ type: 'CustomerContracts', id: 'LIST' }]
    }),
    addCustomerContract: builder.mutation<ICustomerContract[], Partial<ICustomerContract>>({
      // async onQueryStarted(){console.log('⏩ request', 'POST', `${baseUrlApi}customerContracts`)},
      query(body) {
        return {
          url: 'customerContracts',
          method: 'POST',
          body: body
        };
      },
      transformResponse: (response: ICustomerContractsRequestResult) => response.queries.customerContracts,
      invalidatesTags: (result) =>
        result
          ? [
            ...result.map(({ ID }) => ({ type: 'CustomerContracts' as const, ID })),
            { type: 'CustomerContracts', id: 'LIST' },
          ]
          : [{ type: 'CustomerContracts', id: 'LIST' }],
    }),
    deleteCustomerContract: builder.mutation<{ id: number; }, number>({
      // async onQueryStarted(id){console.log('⏩ request', 'DELETE', `${baseUrlApi}customerContracts/${id}`)},
      query(id) {
        return {
          url: `customerContracts/${id}`,
          method: 'DELETE'
        };
      },
      invalidatesTags: (result) => {
        const id = result?.id;
        return (
          result
            ? [
              { type: 'CustomerContracts' as const, id: id },
              { type: 'CustomerContracts', id: 'LIST' },
            ]
            : [{ type: 'CustomerContracts', id: 'LIST' }]
        );
      }
    })
  })
});

export const { useGetCustomerContractsQuery, useUpdateCustomerContractMutation, useAddCustomerContractMutation, useDeleteCustomerContractMutation } = customerContractsApi;
