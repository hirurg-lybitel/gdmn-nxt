// import { PERMISSIONS } from '../permission-map';
import { Tooltip, Typography } from '@mui/material';
import { ReactNode, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useGetPermissionByUserQuery } from '../../../features/permissions';
import { UserState } from '../../../features/user/userSlice';
import { RootState } from '../../../store';
import styles from './permissions-gate.module.less';

// const hasPermission = ({ permissions: string[], scopes }) => {
//   const scopesMap: { [key: string]: any } = {};
//   scopes.forEach((scope: string | number) => {
//     scopesMap[scope] = true;
//   });

//   return permissions.some((permission) => scopesMap[permission]);
// };

export interface PermissionsGateProps {
  children: ReactNode;
  actionCode: number;
  scopes?: any[],
  disableDefault?: boolean,
}

export function PermissionsGate(props: PermissionsGateProps) {
  const { children, scopes, actionCode = -1, disableDefault = true } = props;
  // const { role } = useGetRole();
  const role = '1';

  const user = useSelector<RootState, UserState>(state => state.user);

  const { data, isFetching } = useGetPermissionByUserQuery(
    { actionCode, userID: user.userProfile?.id || -1 },
    { skip: !user.userProfile?.id }
  );

  // console.log('data', isFetching, actionCode, user.userProfile?.id || -1, data);
  // const permissions = PERMISSIONS[role];

  // const permissionGranted = hasPermission({ permissions, scopes });

  // if (!permissionGranted) return <></>;

  if (actionCode < 0) return <>{children}</>;

  const permissionGranted = (() => {
    if (isFetching) {
      if (!disableDefault) return true;
      return false;
    };
    return data?.MODE === 1;
  })();

  if (!permissionGranted) {
    return (
      <Tooltip title={<Typography variant="body1">У вас нет прав на это</Typography>} >
        <div style={{ position: 'relative' }}>
          {children}
          <div
            style={{
              display: 'block',
              zIndex: 99,
              width: '100%',
              height: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          />
        </div>
      </Tooltip>
    );
  };

  return <>{children}</>;
}

export default PermissionsGate;
