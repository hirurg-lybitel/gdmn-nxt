import styles from './app.module.less';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { SignInSignUp } from '@gsbelarus/ui-common-dialogs';
import axios from 'axios';
import type { AxiosError } from 'axios';
import { IAuthResult } from '@gsbelarus/util-api-types';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from './store';
import Typography from '@mui/material/Typography/Typography';
import Button from '@mui/material/Button/Button';
import { setUserName } from './features/user/userSlice';

const baseURL = 'http://localhost:4444';

const post = async (url: string, data: Object): Promise<IAuthResult> => {
  try {
    return (await axios({ method: 'post', url, baseURL, data })).data;
  }
  catch (error: any) {
    const { response, request, message } = error as AxiosError;

    if (response) {
      return { result: 'ERROR', message: error.message };
    }
    else if (request) {
      return { result: 'ERROR', message: `Can't reach server ${baseURL}: ${message}` };
    }
    else {
      return { result: 'ERROR', message: error.message };
    }
  }
};

export function App() {

  const login = useSelector<RootState>( state => state.user.userName );
  const dispatch = useDispatch<AppDispatch>();

  const result =
    <div className={styles.app}>
      {
        login ?
          <Typography>You are logged in as {login}. <Button>Logout</Button></Typography>
        :
          <SignInSignUp
            checkCredentials = { (userName, password) => post('/api/v1/user/signin', { userName, password }) }
            createUser = { (userName, email) => post('/api/v1/user/signup', { userName, email }) }
            onDone = { userName => dispatch(setUserName(userName)) }
          />
      }
    </div>;

  return result;
};

export default App;