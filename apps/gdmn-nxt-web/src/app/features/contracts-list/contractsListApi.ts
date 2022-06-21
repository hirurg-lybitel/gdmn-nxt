import { IContactsList, IRequestResult } from '@gsbelarus/util-api-types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import { baseUrlApi } from '../../const';;

interface IContactsLists{
  contractsList: IContactsList[];
};

type IContactsListRequestResult = IRequestResult<IContactsLists>;

export const contractsListApi = createApi({
  reducerPath: 'contractsList',
  tagTypes: ['ConList'],
  baseQuery: fetchBaseQuery({ baseUrl: baseUrlApi, credentials: 'include' }),
  endpoints: (builder) => ({
    getContractsList: builder.query<IContactsList[], number | void>({
      query: (companyId) => `contracts-list/${companyId}`,
      onQueryStarted(companyId) {
        console.info('⏩ request', 'GET', `${baseUrlApi}contracts-list/${companyId}`);
      },
      transformResponse: (response: IContactsListRequestResult) =>
        response.queries?.contractsList.map(el => ({
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
