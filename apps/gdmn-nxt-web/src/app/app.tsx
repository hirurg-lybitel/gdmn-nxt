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
import { Button, Divider, Typography, Grid } from '@mui/material';
import { SelectMode } from './select-mode/select-mode';
import CreateCustomerAccount from './create-customer-account/create-customer-account';
import { Navigate } from 'react-router-dom';

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

const App = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loginStage } = useSelector<RootState, UserState>( state => state.user );

  console.log('App');

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
    // <div className={className}>

      <Grid container direction="column" justifyContent="center" alignContent="center" sx={{ minHeight: '100vh' }}>
      {/* <CssBaseline /> */}
      {
        loginStage === 'QUERY_LOGIN' || loginStage === 'LAUNCHING' ?
          <h1>Loading...</h1>
          : loginStage === 'SELECT_MODE' ?
            <SelectMode
              employeeModeSelected={ () => dispatch(signInEmployee()) }
              customerModeSelected={ () => dispatch(signInCustomer()) }
            />
          : loginStage === 'CUSTOMER' ? <Navigate to={`/`} /> // <CustomerHomePage />
          : loginStage === 'EMPLOYEE' ? <Navigate to={`/`} /> //<EmployeeHomePage />
          : loginStage === 'CREATE_CUSTOMER_ACCOUNT' ? <CreateCustomerAccount onCancel={ () => dispatch(selectMode()) } />
          : loginStage === 'SIGN_IN_EMPLOYEE' ?
            <SignInSignUp
              checkCredentials={(userName, password) => post('user/signin', { userName, password, employeeMode: true })}
              bottomDecorator={ () => <Typography align="center">Вернуться в<Button onClick={ () => dispatch(selectMode()) }>начало</Button></Typography> }
            />
          :
            <SignInSignUp
              checkCredentials={(userName, password) => post('user/signin', { userName, password })}
              newPassword={(email) => post('user/forgot-password', { email })}
              bottomDecorator={
                () =>
                  <Grid
                    container
                    direction="column"
                    justifyContent="center"
                    sx={{ mt: 1 }}
                    spacing={2}


                  >
                    <Grid item xs={12}>
                      <Typography align="center">Создать новую<Button onClick={ () => dispatch(createCustomerAccount()) }>учетную запись</Button></Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Divider />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography align="center">Вернуться в<Button onClick={ () => dispatch(selectMode()) }>начало</Button></Typography>
                    </Grid>

                  </Grid>


              }
            />
      }
    </Grid>

    // </div>;

  return result;
};

export default App;
