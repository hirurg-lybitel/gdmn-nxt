import { useSelector } from 'react-redux';
import { RootState } from '.';
import { useGetCustomersCrossQuery, useGetCustomersQuery } from '../features/customer/customerApi_new';
import { useGetDepartmentsQuery } from '../features/departments/departmentsApi';
import { useGetKanbanDealsQuery } from '../features/kanban/kanbanApi';
import { useGetWorkTypesQuery } from '../features/work-types/workTypesApi';
import { useGetCustomerContractsQuery } from '../features/customer-contracts/customerContractsApi';
import { useGetBusinessProcessesQuery } from '../features/business-processes';
import { useGetAllUpdatesQuery } from '../features/updates';
import { useGetFiltersDeadlineQuery, useGetLastUsedFilterDeadlineQuery } from '../features/kanban/kanbanFiltersApi';
import { useGetSystemSettingsQuery } from '../features/systemSettings';
import { useGetAllFiltersQuery } from '../features/filters/filtersApi';
import { useGetAllSegmentsQuery } from '../features/Marketing/segments/segmentsApi';
import { UserType } from '@gsbelarus/util-api-types';
import { useEffect } from 'react';
import { clearSocket, setSocketClient, SocketNames } from '@gdmn-nxt/socket';
import { config } from '@gdmn-nxt/config';

/** Загрузка данных на фоне во время авторизации  */
export function InitData() {
  const userId = useSelector<RootState, number>(state => state.user.userProfile?.id ?? -1);
  const ticketsUser = useSelector<RootState, boolean>(state => state.user.userProfile?.type === UserType.Tickets);
  const skip = userId < 0 || ticketsUser;

  useEffect(() => {
    if (userId < 0) return;
    setSocketClient('tickets', {
      url: `https://${config.serverHost}:${config.ticketsPort}`,
      userId: userId
    });

    setSocketClient(SocketNames.streamingUpdate, {
      url: `https://${config.serverHost}:${config.streamingUpdatePort}`,
      userId: userId
    });

    return () => {
      clearSocket('tickets');
      clearSocket(SocketNames.streamingUpdate);
    };
  }, [userId]);

  const { } = useGetSystemSettingsQuery(undefined, { skip });
  const { } = useGetAllUpdatesQuery(undefined, { skip });
  const { } = useGetFiltersDeadlineQuery(undefined, { skip });
  const { } = useGetLastUsedFilterDeadlineQuery(userId, { skip });
  const { } = useGetKanbanDealsQuery({ userId }, { skip });
  const { } = useGetCustomersCrossQuery(undefined, { skip });
  const { } = useGetWorkTypesQuery(undefined, { skip });
  const { } = useGetDepartmentsQuery(undefined, { skip });
  const { } = useGetCustomerContractsQuery(undefined, { skip });
  const { } = useGetBusinessProcessesQuery(undefined, { skip });
  const { } = useGetCustomersQuery(undefined, { skip });
  const { } = useGetAllFiltersQuery(undefined, { skip });
  const { } = useGetAllSegmentsQuery(undefined, { skip });
};
