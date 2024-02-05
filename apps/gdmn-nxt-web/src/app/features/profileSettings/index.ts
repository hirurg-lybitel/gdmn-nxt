import { IProfileSettings, IRequestResult } from '@gsbelarus/util-api-types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import { baseUrlApi } from '../../const';

type IProfileSettingsRequestResult = IRequestResult<{ settings: IProfileSettings }>;

export const profileSettingsApi = createApi({
  reducerPath: 'profileSettings',
  tagTypes: ['settings'],
  baseQuery: fetchBaseQuery({ baseUrl: baseUrlApi, credentials: 'include' }),
  endpoints: (builder) => ({
    getProfileSettings: builder.query<IProfileSettings, number >({
      query: (userId) => `profile-settings/userId/${userId}`,
      transformResponse: (response: IProfileSettingsRequestResult) => response.queries?.settings || {},
      providesTags: (result, error) =>
        result
          ? [{ type: 'settings', id: 'LIST' }]
          : error
            ? [{ type: 'settings', id: 'ERROR' }]
            : [{ type: 'settings', id: 'LIST' }]
    }),
    setProfileSettings: builder.mutation<IProfileSettings, { userId: number, body: Partial<IProfileSettings>}>({
      query({ userId, body }) {
        return {
          url: `profile-settings/userId/${userId}`,
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
    resetProfileSettings: builder.mutation<IProfileSettings, number>({
      query: (userId) => ({
        url: `profile-settings/reset/${userId}`,
        method: 'POST'
      }),
      invalidatesTags: (result, error) =>
        result
          ? [{ type: 'settings', id: 'LIST' }]
          : error
            ? [{ type: 'settings', id: 'ERROR' }]
            : [{ type: 'settings', id: 'LIST' }]
    })
  })
});

export const {
  useGetProfileSettingsQuery,
  useSetProfileSettingsMutation,
  useResetProfileSettingsMutation
} = profileSettingsApi;
