import { IContactWithID, IRequestResult } from '@gsbelarus/util-api-types';
import { createApi } from '@reduxjs/toolkit/dist/query/react';
import { baseQueryByUserType } from '@gdmn-nxt/store/baseUrl';

interface IDepartments {
  departments: IContactWithID[];
};

type IDepartmentsRequestResult = IRequestResult<IDepartments>;

export const departmentsApi = createApi({
  reducerPath: 'departments',
  tagTypes: ['Departments'],
  baseQuery: baseQueryByUserType({ credentials: 'include' }),
  endpoints: (builder) => ({
    getDepartments: builder.query<IContactWithID[], number | void>({
      query: (id) => `departments${id ? `/${id}` : ''}`,
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
      query(body) {
        const { ID: id } = body;
        return {
          url: `departments/${id}`,
          method: 'PUT',
          body: body
        };
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
      query(body) {
        return {
          url: 'departments',
          method: 'POST',
          body: body
        };
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
    deleteDepartment: builder.mutation<{ id: number; }, number>({
      query(id) {
        return {
          url: `departments/${id}`,
          method: 'DELETE'
        };
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
        );
      }
    })
  })
});

export const { useGetDepartmentsQuery, useUpdateDepartmentMutation, useAddDepartmentMutation, useDeleteDepartmentMutation } = departmentsApi;
