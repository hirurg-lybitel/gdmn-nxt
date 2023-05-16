// import { PERMISSIONS } from '../permission-map';
import { Tooltip, Typography } from '@mui/material';
import { ReactNode, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useGetPermissionByUserQuery } from '../../../features/permissions';
import { UserState } from '../../../features/user/userSlice';
import { RootState } from '../../../store';
import styles from './permissions-gate.module.less';
import { Permissions } from '@gsbelarus/util-api-types';

export interface PermissionsGateProps {
  children: ReactNode;
  actionCode?: any;
  scopes?: any[],
  disableDefault?: boolean,
  show?: boolean;
  actionAllowed?: boolean
}

export function PermissionsGate(props: PermissionsGateProps) {
  const { children, scopes, actionCode, disableDefault = true, show = false, actionAllowed = true } = props;

  if (actionAllowed) return <>{children}</>;

  if (!show) {
    return (<></>);
  }
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
}

export default PermissionsGate;
