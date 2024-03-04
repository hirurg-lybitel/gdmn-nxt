import { ContractType, IContract, IQueryOptions, IRequestResult, queryOptionsToParamsString } from '@gsbelarus/util-api-types';
import { FetchBaseQueryError, createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import { baseUrlApi } from '../../const';import { RootState } from '../../store';
import { MaybePromise } from '@reduxjs/toolkit/dist/query/tsHelpers';
import { QueryReturnValue } from '@reduxjs/toolkit/dist/query/baseQueryTypes';
;

interface IContracts{
  contracts: IContract[];
  rowCount: number;
};

type IContractsRequestResult = IRequestResult<IContracts>;

export const contractsListApi = createApi({
  reducerPath: 'contractsList',
  tagTypes: ['ConList'],
  baseQuery: fetchBaseQuery({ baseUrl: baseUrlApi, credentials: 'include' }),
  endpoints: (builder) => ({
    getContractsList: builder.query<{records: IContract[], count?: number}, Partial<IQueryOptions> | void>({
      queryFn: async (options, api, extraOptions, baseQuery) => {
        const state = api.getState() as RootState;
        const systemSettings = state.settings.system;

        const params = queryOptionsToParamsString(options);

        const fetch = baseQuery({
          url: `contracts-list/contractType/${systemSettings?.CONTRACTTYPE}${params ? `?${params}` : ''}`,
          method: 'GET',
        }) as MaybePromise<QueryReturnValue<IContractsRequestResult, FetchBaseQueryError>>;

        const { data, error, meta } = await fetch;

        if (error) {
          return {
            meta,
            error
          };
        }

        return {
          data: {
            records: data?.queries?.contracts ?? [],
            count: data?.queries?.rowCount ?? 0
          },
          meta
        };
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
