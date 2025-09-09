import { ContractType, IContract, IContractDetail, IQueryOptions, IRequestResult, queryOptionsToParamsString } from '@gsbelarus/util-api-types';
import { FetchBaseQueryError, createApi } from '@reduxjs/toolkit/dist/query/react';
import { RootState } from '../../store';
import { MaybePromise } from '@reduxjs/toolkit/dist/query/tsHelpers';
import { QueryReturnValue } from '@reduxjs/toolkit/dist/query/baseQueryTypes';
import { baseQueryByUserType } from '@gdmn-nxt/store/baseUrl';
;

interface IContracts {
  contracts: IContract[];
  rowCount: number;
};

type IContractsRequestResult = IRequestResult<IContracts>;
type IContractDetailsRequestResult = IRequestResult<{ contractDetails: IContractDetail[]; }>;

export const contractsListApi = createApi({
  reducerPath: 'contractsList',
  tagTypes: ['ConList'],
  baseQuery: baseQueryByUserType({ credentials: 'include' }),
  endpoints: (builder) => ({
    getContractsList: builder.query<{ records: IContract[], count?: number; }, Partial<IQueryOptions> | void>({
      queryFn: async (options, api, extraOptions, baseQuery) => {
        const state = api.getState() as RootState;
        const systemSettings = state.settings.system;
        const contractType = systemSettings?.CONTRACTTYPE ?? ContractType.GS;

        const params = queryOptionsToParamsString(options);

        const fetch = baseQuery({
          url: `contracts-list/contractType/${contractType}${params ? `?${params}` : ''}`,
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
    }),
    getContractDetails: builder.query<IContractDetail[], number>({
      queryFn: async (contractId, api, extraOptions, baseQuery) => {
        const state = api.getState() as RootState;
        const systemSettings = state.settings.system;

        const fetch = baseQuery({
          url: `contracts-list/contractType/${systemSettings?.CONTRACTTYPE}/details/${contractId}`,
          method: 'GET',
        }) as MaybePromise<QueryReturnValue<IContractDetailsRequestResult, FetchBaseQueryError>>;

        const { data, error, meta } = await fetch;

        if (error) {
          return {
            meta,
            error
          };
        }

        return {
          data: data?.queries.contractDetails ?? [],
          meta
        };
      },
    })
  })
});

export const {
  useGetContractsListQuery,
  useGetContractDetailsQuery
} = contractsListApi;
