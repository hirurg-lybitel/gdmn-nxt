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
import Typography from '@mui/material/Typography/Typography';
import Button from '@mui/material/Button/Button';
import { setUserName } from './features/user/userSlice';
import { useEffect, useState } from 'react';
import { baseURL } from './const';
import { Cookie } from '@mui/icons-material';

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

export function App() {
  const dispatch = useDispatch<AppDispatch>();
  const [login, setLogin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() =>{
    const login_f = async () => {
      await fetch('http://localhost:4444/user', {method: 'GET', credentials: 'include'}).then(response => {
        response.status == 200 ? setLogin(true) : setLogin(false)
      })
      setTimeout(() => {
        setLoading(false);
      },500)
      
    } 
    login_f();  
  }, [])

  const result =
    <div className={styles.app}>
      {
        loading ?
        <h1>Loading...</h1>
        :
          login ?
            <Typography variant = 'h1'>You are auto logged in. <Button 
            onClick = {() => fetch('http://localhost:4444/logout', {method: 'GET', credentials: 'include'}).then(response => {
              response.status == 200 ? setLogin(false) : setLogin(true)
            })}
            >Logout</Button></Typography>
          :
            <SignInSignUp
              checkCredentials = { (userName, password) => post('/api/v1/user/signin', { userName, password }) }
              createUser = { (userName, email) => post('/api/v1/user/signup', { userName, email }) }
              newPassword = {(email) => post('/api/v1/user/forgot-password', {email})}
              onDone = { userName => dispatch(setUserName(userName)) }
            />
      }
    </div>;

  return result;
};

export default App;