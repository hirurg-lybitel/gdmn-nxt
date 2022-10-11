import { useSelector } from 'react-redux';
import { RootState } from '.';
import { useGetCustomersCrossQuery, useGetCustomersQuery } from '../features/customer/customerApi_new';
import { useGetDepartmentsQuery } from '../features/departments/departmentsApi';
import { useGetKanbanDealsQuery } from '../features/kanban/kanbanApi';
import { UserState } from '../features/user/userSlice';
import { useGetWorkTypesQuery } from '../features/work-types/workTypesApi';
import { useGetCustomerContractsQuery } from '../features/customer-contracts/customerContractsApi';

/** Загрузка данных на фоне во время авторизации  */
export function InitData() {
  const { userProfile } = useSelector<RootState, UserState>(state => state.user);

  const { } = useGetCustomersQuery({
    pagination: {
      pageNo: 0,
      pageSize: 10
    }
  });
  const { } = useGetKanbanDealsQuery({ userId: userProfile?.id || -1 });
  const { } = useGetCustomersCrossQuery();
  const { } = useGetWorkTypesQuery();
  const { } = useGetDepartmentsQuery();
  const { } = useGetCustomerContractsQuery();
};
