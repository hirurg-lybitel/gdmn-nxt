import { IContactWithID, IRequestResult } from "@gsbelarus/util-api-types";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/dist/query/react";
import { baseUrlApi } from '../../const';

interface IDepartments{
  departments: IContactWithID[];
};

type IDepartmentsRequestResult = IRequestResult<IDepartments>;

export const departmentsApi = createApi({
  reducerPath: 'departments',
  tagTypes: ['Departments'],
  baseQuery: fetchBaseQuery({ baseUrl: baseUrlApi, credentials: 'include' }),
  endpoints: (builder) => ({
    getDepartments: builder.query<IContactWithID[], number | void>({
      query: (id) => `departments${id ? `/${id}` : ''}`,
      async onQueryStarted(){console.log('⏩ request', "GET", `${baseUrlApi}departments`)},
      transformResponse: (response: IDepartmentsRequestResult) => response.queries?.departments || [],
      providesTags: (result, error) =>
      result
      ? [
          ...result.map(({ ID }) => ({ type: 'Departments' as const, ID })),
          { type: 'Departments', id: 'LIST' },
        ]
      : error
        ? [{ type: 'Departments', id: 'ERROR' }]
        : [{ type: 'Departments', id: 'LIST' }]

    }),
    updateDepartment: builder.mutation<IDepartmentsRequestResult, Partial<IContactWithID>>({
      async onQueryStarted({ID:id}){console.log('⏩ request', "PUT", `${baseUrlApi}departments/${id}`)},
      query(body) {
        const {ID:id} = body;
        return {
          url: `departments/${id}`,
          method: 'PUT',
          body: body
        }
      },
      invalidatesTags: (result, error) =>
        result
          ? [
              ...result.queries.departments.map(({ ID }) => ({ type: 'Departments' as const, ID })),
              { type: 'Departments', id: 'LIST' },
            ]
          : error
            ? [{ type: 'Departments', id: 'ERROR' }]
            : [{ type: 'Departments', id: 'LIST' }]
    }),
    addDepartment: builder.mutation<IContactWithID[], Partial<IContactWithID>>({
      async onQueryStarted(){console.log('⏩ request', "POST", `${baseUrlApi}departments`)},
      query(body) {
        return {
          url: `departments`,
          method: 'POST',
          body: body
        }
      },
      transformResponse: (response: IDepartmentsRequestResult) => response.queries.departments,
      invalidatesTags: (result) =>
        result
          ? [
              ...result.map(({ ID }) => ({ type: 'Departments' as const, ID })),
              { type: 'Departments', id: 'LIST' },
            ]
          : [{ type: 'Departments', id: 'LIST' }],
    }),
    deleteDepartment: builder.mutation<{id: number}, number>({
      async onQueryStarted(id){console.log('⏩ request', "DELETE", `${baseUrlApi}departments/${id}`)},
      query(id) {
        return {
          url: `departments/${id}`,
          method: 'DELETE'
        }
      },
      invalidatesTags: (result) => {
        const id = result?.id;
        return (
          result
            ? [
                { type: 'Departments' as const, id: id },
                { type: 'Departments', id: 'LIST' },
              ]
            : [{ type: 'Departments', id: 'LIST' }]
          )
        }
    })
  })
});

export const { useGetDepartmentsQuery, useUpdateDepartmentMutation, useAddDepartmentMutation, useDeleteDepartmentMutation } = departmentsApi;
