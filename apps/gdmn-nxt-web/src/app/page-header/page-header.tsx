import { Button, Stack } from '@mui/material';
import { ReactChild, ReactFragment, ReactPortal } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { setLoginStage, UserState } from '../features/user/userSlice';
import './page-header.module.less';

export function PageHeader(props: {children: ReactChild | ReactFragment | null}) {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector<RootState, UserState>( state => state.user );
  return (
    <Stack direction='column' spacing={4}>
      <Stack direction='row' justifyContent='space-around' alignItems='center'>
        <h1>БелГИСС</h1>
        <h1>Режим {user.loginStage === 'CUSTOMER' ? 'Клиента' : 'Работника'}</h1>
        <Button onClick = {() => dispatch(setLoginStage('QUERY_LOGOUT'))}>
          Log Out
        </Button>
      </Stack>
      {props.children}
    </Stack>
  );
}

export default PageHeader;