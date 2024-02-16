import { IRequestResult, ISystemSettings } from '@gsbelarus/util-api-types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import { baseUrlApi } from '../../const';

type ISystemSettingsRequestResult = IRequestResult<{ settings: ISystemSettings }>;

export const systemSettingsApi = createApi({
  reducerPath: 'systemSettings',
  tagTypes: ['settings'],
  baseQuery: fetchBaseQuery({ baseUrl: baseUrlApi, credentials: 'include' }),
  endpoints: (builder) => ({
    getSystemSettings: builder.query<ISystemSettings, void>({
      query: () => 'system-settings',
      transformResponse: (response: ISystemSettingsRequestResult) => response.queries?.settings || {},
      providesTags: (result, error) =>
        result
          ? [{ type: 'settings', id: 'LIST' }]
          : error
            ? [{ type: 'settings', id: 'ERROR' }]
            : [{ type: 'settings', id: 'LIST' }]
    }),
    setSystemSettings: builder.mutation<ISystemSettings, Partial<ISystemSettings>>({
      query(body) {
        return {
          url: 'system-settings',
          method: 'PUT',
          body: body
        };
      },
      invalidatesTags: (result, error) =>
        result
          ? [{ type: 'settings', id: 'LIST' }]
          : error
            ? [{ type: 'settings', id: 'ERROR' }]
            : [{ type: 'settings', id: 'LIST' }]
    }),
  })
});

export const {
  useGetSystemSettingsQuery,
  useSetSystemSettingsMutation
} = systemSettingsApi;
