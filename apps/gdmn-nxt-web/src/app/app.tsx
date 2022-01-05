import styles from './app.module.less';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { SignInSignUp } from '@gsbelarus/ui-common-dialogs';
import axios from 'axios';
import type { AxiosError, AxiosRequestConfig } from 'axios';
import { IAuthResult } from '@gsbelarus/util-api-types';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from './store';
import { setLoginStage, setSelectMode, UserState } from './features/user/userSlice';
import { useEffect } from 'react';
import { baseURL } from './const';
import { SelectMode } from './select-mode/select-mode';
import { Button } from '@mui/material';
import EmployeeHomePage from './employee-home-page/employee-home-page';
import CustomerHomePage from './customer-home-page/customer-home-page';

const query = async (config: AxiosRequestConfig<any>): Promise<IAuthResult> => {
  try {
    return (await axios(config)).data;
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

const post = (url: string, data: Object) => query({ method: 'post', url, baseURL, data, withCredentials: true });
const get = (url: string) => query({ method: 'get', url, baseURL, withCredentials: true });

export function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { loginStage } = useSelector<RootState, UserState>( state => state.user );

  useEffect(() => {
    (async function () {
      switch (loginStage) {
        case 'LAUNCHING':
          // приложение загружается
          // здесь мы можем разместить код, который еще
          // до первой связи с сервером необходимо выполнить
          dispatch(setLoginStage('QUERY_LOGIN'));
          break;

        case 'QUERY_LOGIN':
          await fetch('http://localhost:4444/user', { method: 'GET', credentials: 'include' })
            .then( response => response.json() )
            .then( data => {
              if (data[ 'userName' ]) {
                if (data['gedeminUser']) {
                  dispatch(setLoginStage('EMPLOYEE'));
                } else {
                  dispatch(setLoginStage('CUSTOMER'));
                }
              } else {
                dispatch(setSelectMode());
              }
            });
          break;

        case 'QUERY_LOGOUT':
          await get('/logout');
          dispatch(setSelectMode());
          break;
      }
    })();
  }, [ loginStage ]);

  const result =
    <div className={styles.app}>
      {
        loginStage === 'QUERY_LOGIN' || loginStage === 'LAUNCHING' ?
          <h1>Loading...</h1>
          : loginStage === 'SELECT_MODE' ?
            <SelectMode
              employeeModeSelected={ () => dispatch(setLoginStage('SIGN_IN_EMPLOYEE')) }
              customerModeSelected={ () => dispatch(setLoginStage('SIGN_IN_CUSTOMER')) }
            />
          : loginStage === 'CUSTOMER' ? <CustomerHomePage />
          : loginStage === 'EMPLOYEE' ? <EmployeeHomePage />
          : loginStage === 'SIGN_IN_EMPLOYEE' ?
            <SignInSignUp
              checkCredentials={(userName, password) => post('/api/v1/user/signin', { userName, password, employeeMode: true })}
              bottomDecorator={ () => <Button variant="contained" onClick={ () => dispatch(setLoginStage('SIGN_IN_CUSTOMER')) }>Войти в режиме клиента</Button>}
            />
          :
            <SignInSignUp
              checkCredentials={(userName, password) => post('/api/v1/user/signin', { userName, password })}
              createUser={(userName, email) => post('/api/v1/user/signup', { userName, email })} // Переделать с useEffect P.S. Костыль
              newPassword={(email) => post('/api/v1/user/forgot-password', { email })}
              bottomDecorator={ () => <Button variant="contained" onClick={ () => dispatch(setLoginStage('SIGN_IN_EMPLOYEE')) }>Войти в режиме сотрудника</Button>}
            />
      }
    </div>;

  return result;
};

export default App;
