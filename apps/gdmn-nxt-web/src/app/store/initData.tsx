import { useSelector } from 'react-redux';
import { RootState } from '.';
import { useGetCustomersCrossQuery, useGetCustomersQuery } from '../features/customer/customerApi_new';
import { useGetDepartmentsQuery } from '../features/departments/departmentsApi';
import { useGetKanbanDealsQuery } from '../features/kanban/kanbanApi';
import { UserState } from '../features/user/userSlice';
import { useGetWorkTypesQuery } from '../features/work-types/workTypesApi';
import { useGetCustomerContractsQuery } from '../features/customer-contracts/customerContractsApi';
import { useGetBusinessProcessesQuery } from '../features/business-processes';
import { useGetAllUpdatesQuery } from '../features/updates';
import { useGetFiltersDeadlineQuery, useGetLastUsedFilterDeadlineQuery } from '../features/kanban/kanbanFiltersApi';

/** Загрузка данных на фоне во время авторизации  */
export function InitData() {
  const userId = useSelector<RootState, number>(state => state.user.userProfile?.id ?? -1);
  const skip = userId < 0;
  const { } = useGetAllUpdatesQuery(undefined, { skip });
  const { } = useGetFiltersDeadlineQuery(undefined, { skip });
  const { } = useGetLastUsedFilterDeadlineQuery(userId, { skip });
  const { } = useGetKanbanDealsQuery({ userId }, { skip });
  const { } = useGetCustomersCrossQuery(undefined, { skip });
  const { } = useGetWorkTypesQuery(undefined, { skip });
  const { } = useGetDepartmentsQuery(undefined, { skip });
  const { } = useGetCustomerContractsQuery(undefined, { skip });
  const { } = useGetBusinessProcessesQuery(undefined, { skip });
  const { } = useGetCustomersQuery({
    pagination: {
      pageNo: 0,
      pageSize: 10
    }
  }, { skip });
};
