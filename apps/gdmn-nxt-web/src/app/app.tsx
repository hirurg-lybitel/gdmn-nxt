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
import { queryLogin, selectMode, signedInCustomer, signedInEmployee, signInCustomer, signInEmployee, createCustomerAccount, UserState } from './features/user/userSlice';
import { useEffect } from 'react';
import { baseUrl } from './const';
import { Button, Divider } from '@mui/material';
import EmployeeHomePage from './employee-home-page/employee-home-page';
import CustomerHomePage from './customer-home-page/customer-home-page';
import { SelectMode } from './select-mode/select-mode';
import CreateCustomerAccount from './create-customer-account/create-customer-account';

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
      return { result: 'ERROR', message: `Can't reach server ${baseUrl}: ${message}` };
    }
    else {
      return { result: 'ERROR', message: error.message };
    }
  }
};

const post = (url: string, data: Object) => query({ method: 'post', url, baseURL: baseUrl, data, withCredentials: true });
const get = (url: string) => query({ method: 'get', url, baseURL: baseUrl, withCredentials: true });

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
          dispatch(queryLogin());
          break;

        case 'QUERY_LOGIN':
          await fetch(`${baseUrl}user`, { method: 'GET', credentials: 'include' })
            .then( response => response.json() )
            .then( data => {
              if (data[ 'userName' ]) {
                if (data['gedeminUser']) {
                  dispatch(signedInEmployee({ userName: data['userName'] }));
                } else {
                  dispatch(signedInCustomer({ userName: data['userName'] }));
                }
              } else {
                dispatch(selectMode());
              }
            });
          break;

        case 'QUERY_LOGOUT':
          await get('logout');
          dispatch(selectMode());
          break;
      }
    })();
  }, [ loginStage ]);

  const className = styles.app + (loginStage === 'CUSTOMER' || loginStage === 'EMPLOYEE' ? '' : (' ' + styles.login));

  const result =
    <div className={className}>
      {
        loginStage === 'QUERY_LOGIN' || loginStage === 'LAUNCHING' ?
          <h1>Loading...</h1>
          : loginStage === 'SELECT_MODE' ?
            <SelectMode
              employeeModeSelected={ () => dispatch(signInEmployee()) }
              customerModeSelected={ () => dispatch(signInCustomer()) }
            />
          : loginStage === 'CUSTOMER' ? <CustomerHomePage />
          : loginStage === 'EMPLOYEE' ? <EmployeeHomePage />
          : loginStage === 'CREATE_CUSTOMER_ACCOUNT' ? <CreateCustomerAccount />
          : loginStage === 'SIGN_IN_EMPLOYEE' ?
            <SignInSignUp
              checkCredentials={(userName, password) => post('user/signin', { userName, password, employeeMode: true })}
              bottomDecorator={ () => <Button variant="contained" onClick={ () => dispatch(signInCustomer()) }>Войти в режиме клиента</Button>}
            />
          :
            <SignInSignUp
              checkCredentials={(userName, password) => post('user/signin', { userName, password })}
              newPassword={(email) => post('user/forgot-password', { email })}
              bottomDecorator={
                () =>
                  <>
                    <Button variant="contained" onClick={ () => dispatch(createCustomerAccount()) }>Создать учетную запись</Button>
                    <Divider />
                    <Button variant="contained" onClick={ () => dispatch(signInEmployee()) }>Войти в режиме сотрудника</Button>
                  </>
              }
            />
      }
    </div>;

  return result;
};

export default App;
