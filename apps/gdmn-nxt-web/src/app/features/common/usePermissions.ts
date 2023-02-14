import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { UserState } from '../user/userSlice';
import { RootState } from '../../store';
import { useGetPermissionByUserQuery } from '../permissions';
import { IPermissionByUser } from '@gsbelarus/util-api-types';

function usePermissions(actionCode:number):[boolean, IPermissionByUser | undefined] {
  const user = useSelector<RootState, UserState>(state => state.user);

  const { data, isFetching } = useGetPermissionByUserQuery(
    { actionCode, userID: user.userProfile?.id || -1 },
    { skip: !user.userProfile?.id }
  );

  return [isFetching, data];
}

export { usePermissions };