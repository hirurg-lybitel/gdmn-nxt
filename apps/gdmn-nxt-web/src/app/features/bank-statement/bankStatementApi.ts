// import { IBankStatement, IRequestResult } from '@gsbelarus/util-api-types';
// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
// import { baseUrlApi } from '../../const';

// interface IBankStatements{
//     bankStatement: IBankStatement[];
// };

// type IBankStatementRequestResult = IRequestResult<IBankStatements>;

// export const bankStatementApi = createApi({
//   reducerPath: 'actCompletion',
//   tagTypes: ['Act'],
//   baseQuery: fetchBaseQuery({ baseUrl: baseUrlApi, credentials: 'include' }),
//   endpoints: (builder) => ({
//     getBankStatementApi: builder.query<IBankStatement[], number | void>({
//       query: (customerId) => `bank-statement${customerId ? `/${customerId}` : ''}`,
//       onQueryStarted(customerId) {
//         console.info('⏩ request', 'GET', `${baseUrlApi}bank-statement${customerId ? `/${customerId}` : ''}`);
//       },
//       transformResponse: (response: IBankStatementRequestResult) => response.queries?.bankStatement.map(act => ({ ...act, DOCUMENTDATE: new Date(act.DOCUMENTDATE) })) || [],
//       providesTags: (result) =>
//         result
//           ? [...result.map(({ ID }) => ({ type: 'Act' as const, ID }))]
//           : [{ type: 'Act', id: 'LIST' }],
//     })
//   })
// });

// export const { useGetBankStatementQuery } = bankStatementApi;