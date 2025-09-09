import { baseQueryByUserType } from '@gdmn-nxt/store/baseUrl';
import { IBankStatement, IRequestResult } from '@gsbelarus/util-api-types';
import { createApi } from '@reduxjs/toolkit/dist/query/react';

interface IBankStatements {
  bankStatements: IBankStatement[];
};

type IBankStatementRequestResult = IRequestResult<IBankStatements>;

export const bankStatementApi = createApi({
  reducerPath: 'bankStatement',
  tagTypes: ['BankSt'],
  baseQuery: baseQueryByUserType({ credentials: 'include' }),
  endpoints: (builder) => ({
    getBankStatement: builder.query<IBankStatement[], number | void>({
      query: (companyId) => `bank-statement/${companyId}`,
      transformResponse: (response: IBankStatementRequestResult) => response.queries?.bankStatements.map(bankSt => ({ ...bankSt, DOCUMENTDATE: new Date(bankSt.DOCUMENTDATE) })) || [],
      providesTags: (result) =>
        result
          ? [...result.map(({ ID }) => ({ type: 'BankSt' as const, ID }))]
          : [{ type: 'BankSt', id: 'LIST' }],
    })
  })
});

export const { useGetBankStatementQuery } = bankStatementApi;
