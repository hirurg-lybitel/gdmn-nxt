import { IRequestResult, ISystemSettings } from '@gsbelarus/util-api-types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import { baseUrlApi } from '@gdmn/constants/client';
import { setSystemSettings } from '../../store/settingsSlice';

type ISystemSettingsRequestResult = IRequestResult<{ settings: ISystemSettings[] }>;

export const systemSettingsApi = createApi({
  reducerPath: 'systemSettings',
  tagTypes: ['settings'],
  baseQuery: fetchBaseQuery({ baseUrl: baseUrlApi, credentials: 'include' }),
  endpoints: (builder) => ({
    getSystemSettings: builder.query<ISystemSettings, void>({
      query: () => 'system-settings',
      transformResponse: (response: ISystemSettingsRequestResult) => response.queries?.settings[0] || {},
      providesTags: (result, error) =>
        result
          ? [{ type: 'settings', id: 'LIST' }]
          : error
            ? [{ type: 'settings', id: 'ERROR' }]
            : [{ type: 'settings', id: 'LIST' }],
      onQueryStarted: async (body, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(setSystemSettings(data));
        } catch (e) {
          console.error(e);
        }
      }
    }),
    setSystemSettings: builder.mutation<ISystemSettings, Partial<ISystemSettings>>({
      query({ ID = -1, ...body }) {
        return {
          url: `system-settings/${ID > 0 ? ID : null}`,
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
