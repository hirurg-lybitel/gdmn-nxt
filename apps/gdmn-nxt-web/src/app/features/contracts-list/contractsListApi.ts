import { ContractType, IContract, IRequestResult } from '@gsbelarus/util-api-types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import { baseUrlApi } from '../../const';;

interface IContracts{
  contracts: IContract[];
};

type IContractsRequestResult = IRequestResult<IContracts>;

export const contractsListApi = createApi({
  reducerPath: 'contractsList',
  tagTypes: ['ConList'],
  baseQuery: fetchBaseQuery({ baseUrl: baseUrlApi, credentials: 'include' }),
  endpoints: (builder) => ({
    getContractsList: builder.query<IContract[], { companyId: number, contractType?: ContractType}>({
      query: ({ companyId, contractType = ContractType.GS }) => `contracts-list/${companyId}/contractType/${contractType}`,
      transformResponse: (response: IContractsRequestResult) =>
        response.queries?.contracts.map(el => ({
          ...el,
          DOCUMENTDATE: new Date(el.DOCUMENTDATE),
          DATEBEGIN: new Date(el.DATEBEGIN),
          DATEEND: new Date(el.DATEEND),
        })) || [],
      providesTags: (result) =>
        result
          ? [...result.map(({ ID }) => ({ type: 'ConList' as const, ID }))]
          : [{ type: 'ConList', id: 'LIST' }],
    })
  })
});

export const { useGetContractsListQuery } = contractsListApi;
