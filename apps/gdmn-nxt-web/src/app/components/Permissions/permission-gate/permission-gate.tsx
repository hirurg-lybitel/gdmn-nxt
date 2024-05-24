// import { PERMISSIONS } from '../permission-map';
import { Tooltip, Typography } from '@mui/material';
import { ReactNode } from 'react';

export interface PermissionsGateProps {
  children: ReactNode;
  show?: boolean;
  actionAllowed?: boolean
}

export function PermissionsGate(props: PermissionsGateProps) {
  const { children, show = false, actionAllowed = true } = props;

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
