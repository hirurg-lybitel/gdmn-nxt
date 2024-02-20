import { ContractType, IContract, IRequestResult } from '@gsbelarus/util-api-types';
import { FetchBaseQueryError, createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import { baseUrlApi } from '../../const';import { RootState } from '../../store';
import { MaybePromise } from '@reduxjs/toolkit/dist/query/tsHelpers';
import { QueryReturnValue } from '@reduxjs/toolkit/dist/query/baseQueryTypes';
;

interface IContracts{
  contracts: IContract[];
};

type IContractsRequestResult = IRequestResult<IContracts>;

export const contractsListApi = createApi({
  reducerPath: 'contractsList',
  tagTypes: ['ConList'],
  baseQuery: fetchBaseQuery({ baseUrl: baseUrlApi, credentials: 'include' }),
  endpoints: (builder) => ({
    getContractsList: builder.query<IContract[], { companyId: number }>({
      queryFn: async ({ companyId }, api, extraOptions, baseQuery) => {
        const state = api.getState() as RootState;
        const systemSettings = state.settings.system;

        const fetch = baseQuery({
          url: `contracts-list/${companyId}/contractType/${systemSettings?.CONTRACTTYPE}`,
          method: 'GET',
        }) as MaybePromise<QueryReturnValue<IContractsRequestResult, FetchBaseQueryError>>;

        const result = await fetch;
        return { data: result.data?.queries?.contracts ?? [] };
      },
      // query: ({ companyId, contractType = ContractType.GS }) => {
      //   return {
      //     url: `contracts-list/${companyId}/contractType/${contractType}`,
      //     method: 'GET',
      //   };
      // },
      // transformResponse: (response: IContractsRequestResult) =>
      //   response.queries?.contracts.map(el => ({
      //     ...el,
      //     DOCUMENTDATE: new Date(el.DOCUMENTDATE),
      //     DATEBEGIN: new Date(el.DATEBEGIN),
      //     DATEEND: new Date(el.DATEEND),
      //   })) || [],
      // providesTags: (result) =>
      //   result
      //     ? [...result.map(({ ID }) => ({ type: 'ConList' as const, ID }))]
      //     : [{ type: 'ConList', id: 'LIST' }],
    })
  })
});

export const { useGetContractsListQuery } = contractsListApi;
