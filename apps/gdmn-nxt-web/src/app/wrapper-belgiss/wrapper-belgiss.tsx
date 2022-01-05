import { Button, Stack } from '@mui/material';
import { ReactChild, ReactFragment, ReactPortal } from 'react';
import './wrapper-belgiss.module.less';

/* eslint-disable-next-line */
export interface WrapperBelgissProps {
  logout: () => void;
  children: ReactChild | ReactFragment | null;
  userType: string;
}

export function WrapperBelgiss({children, userType, logout}: WrapperBelgissProps) {
  return (
    <Stack direction='column' spacing={4}>
      <Stack direction='row' justifyContent='space-around' alignItems='center'>
        <h1>БелГИСС</h1>
        <h1>Режим {userType}</h1>
        <Button onClick = {logout}>
          Log Out
        </Button>
      </Stack>
      {children}
    </Stack>
  );
}

export default WrapperBelgiss;