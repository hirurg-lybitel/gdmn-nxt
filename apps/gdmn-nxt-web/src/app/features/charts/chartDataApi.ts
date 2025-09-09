import { IChartSumByperiod, IChartBusinessDirection, IRequestResult } from '@gsbelarus/util-api-types';
import { createApi } from '@reduxjs/toolkit/dist/query/react';
import { baseQueryByUserType } from '@gdmn-nxt/store/baseUrl';

interface IChartData {
  sumByperiod?: IChartSumByperiod[];
  businessDirection?: IChartBusinessDirection[];
};

type IChartDataRequestResult = IRequestResult<IChartData>;

export interface IChartFilter {
  [key: string]: any;
};

export const chartDataApi = createApi({
  reducerPath: 'chartData',
  baseQuery: baseQueryByUserType({ credentials: 'include' }),
  endpoints: (builder) => ({
    getSumByPeriod: builder.query<IChartSumByperiod[], IChartFilter>({
      query: (options) => {
        const params = [];

        for (const [name, value] of Object.entries(options)) {
          params.push(`${name}=${Array.isArray(value) ? value.join(',') : value}`);
        };

        return ({
          url: `charts/sumbyperiod?${params.join('&')}`,
          method: 'GET',
        });
      },
      // onQueryStarted(options) {
      //   const params = [];

      //   for (const [name, value] of Object.entries(options)) {
      //     params.push(`${name}=${value}`);
      //   };

      //   console.info('⏩ request', 'GET', `${baseUrlApi}charts/sumbyperiod?${params.join('&')}`);
      // },
      transformResponse: (response: IChartDataRequestResult) => response.queries?.sumByperiod?.map(el => ({ ...el, ONDATE: new Date(el.ONDATE) })) || [],
    }),
    getBusinessDirection: builder.query<IChartBusinessDirection[], IChartFilter>({
      query: (options) => {
        const params = [];

        for (const [name, value] of Object.entries(options)) {
          params.push(`${name}=${Array.isArray(value) ? value.join(',') : value}`);
        };
        return {
          url: `charts/businessDirection?${params.join('&')}`,
        };
      },
      transformResponse: (response: IChartDataRequestResult) => response.queries.businessDirection || []
    })
  })
});

export const { useGetSumByPeriodQuery, useGetBusinessDirectionQuery } = chartDataApi;
