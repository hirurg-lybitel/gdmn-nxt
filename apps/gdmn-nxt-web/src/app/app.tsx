import { SignInSignUp } from '@gsbelarus/ui-common-dialogs';
import axios from 'axios';
import type { AxiosError, AxiosRequestConfig } from 'axios';
import { IAuthResult } from '@gsbelarus/util-api-types';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from './store';
import { queryLogin, selectMode, signedInCustomer, signedInEmployee, signInCustomer, signInEmployee, createCustomerAccount, UserState, renderApp } from './features/user/userSlice';
import { useEffect } from 'react';
import { baseUrl } from './const';
import { Button, Divider, Typography, Stack } from '@mui/material';
import { SelectMode } from './select-mode/select-mode';
import CreateCustomerAccount from './create-customer-account/create-customer-account';
import { Navigate } from 'react-router-dom';
import { CircularIndeterminate } from './components/helpers/circular-indeterminate/circular-indeterminate';
import { useGetCustomersQuery } from './features/customer/customerApi_new';
import { useGetKanbanDealsQuery } from './features/kanban/kanbanApi';
import { InitData } from './store/initData';
import { useGetProfileSettingsQuery } from './features/profileSettings';
import { setStyleMode } from './store/settingsSlice';
import { setPageIdFound } from './store/settingsSlice';
import { setActiveMenu } from './store/settingsSlice';
import menuItems from './menu-items';
import { IMenuItem } from './menu-items';
import { useGetPermissionByUserQuery } from './features/permissions';
import { useState } from 'react';
import { ColorMode } from '@gsbelarus/util-api-types';

const query = async (config: AxiosRequestConfig<any>): Promise<IAuthResult> => {
  try {
    return (await axios(config)).data;
  } catch (error: any) {
    const { response, request, message } = error as AxiosError;

    if (response) {
      return { result: 'ERROR', message: error.message };
    } else if (request) {
      return { result: 'ERROR', message: `Can't reach server ${baseUrl}: ${message}` };
    } else {
      return { result: 'ERROR', message: error.message };
    }
  }
};

const post = (url: string, data: Object) => query({ method: 'post', url, baseURL: baseUrl, data, withCredentials: true });

export interface AppProps {
  forWait?:boolean
}

export default function App(props: AppProps) {
  const { forWait } = props;
  const dispatch = useDispatch<AppDispatch>();
  const { loginStage, userProfile } = useSelector<RootState, UserState>(state => state.user);
  const userId = userProfile?.id;
  const { data: settings, isLoading } = useGetProfileSettingsQuery(userId || -1, { skip: !userId });
  const themeType = settings?.MODE;

  useEffect(()=>{
    if (themeType === undefined) {
      return;
    }
    if (themeType === 'dark') {
      dispatch(setStyleMode(ColorMode.Dark));
    } else {
      dispatch(setStyleMode(ColorMode.Light));
    }
  }, [themeType]);

  /** Загрузка данных на фоне во время авторизации  */
  InitData();

  const appSettings = useSelector((state: RootState) => state.settings);
  const pageIdFound = useSelector((state: RootState) => state.settings.pageIdFound);
  const [actionCode, setActionCode] = useState<number>(-3);
  const { data: permissions, isFetching } = useGetPermissionByUserQuery(
    { actionCode, userID: userProfile?.id || -1 }, { skip: !userProfile?.id || actionCode < 1 }
  );

  const pathName:string[] = window.location.pathname.split('/');
  pathName.splice(0, 1);
  // Поиск и установка id страницы, который соответствует url, в state
  useEffect(() => {
    if (pageIdFound) {
      return;
    }
    const flatMenuItems = (items: IMenuItem[]): IMenuItem[] =>
      items.map(item =>
        item.type === 'item'
          ? item
          : flatMenuItems(item.children || [])).flatMap(el => el);

    const flattedMenuItems = flatMenuItems(menuItems.items);
    const path = (pathName.filter((pathItem, index) => index !== 0 && pathItem)).join('/');
    const page = (flattedMenuItems.find(item => item.url === path));
    if (page) {
      if (page.checkAction) {
        if (actionCode < 1) {
          setActionCode(page.checkAction);
        }
        if (!permissions) {
          return;
        }
        if (permissions?.MODE === 1) {
          dispatch(setActiveMenu(page.id));
        } else {
          window.location.href = window.location.origin + '/employee/dashboard/overview';
        }
      } else {
        dispatch(setActiveMenu(page.id));
      }
    } else {
      dispatch(setActiveMenu('dashboard'));
    }

    dispatch(setPageIdFound(true));
  }, [appSettings, permissions]);

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
            .then(response => response.json())
            .then(data => {
              if (data.userName) {
                if (data.gedeminUser) {
                  dispatch(signedInEmployee({ ...data }));
                } else {
                  dispatch(signedInCustomer({ userName: data.userName, id: data.id, contactkey: data.contactkey }));
                }
              } else {
                dispatch(selectMode());
              }
            });
          break;
        case 'OTHER_LOADINGS':
          if (themeType === undefined || !pageIdFound) {
            return;
          }
          if (forWait) {
            return;
          }
          dispatch(renderApp());
          break;
      }
    })();
  }, [loginStage, themeType, pageIdFound, forWait]);

  useEffect(() => {
    if (loginStage === 'SELECT_MODE') dispatch(signInEmployee());
  }, [loginStage]);

  const result =
    <Stack direction="column" justifyContent="center" alignContent="center" sx={{ margin: '0 auto', height: '100vh', maxWidth: '440px' }}>
      {
        loginStage === 'QUERY_LOGIN' || loginStage === 'LAUNCHING' || loginStage === 'OTHER_LOADINGS' ?
          <Stack spacing={2}>
            <CircularIndeterminate open={true} size={100} />
            <Typography variant="overline" color="gray" align="center">
              подключение
            </Typography>
          </Stack>
          : loginStage === 'SELECT_MODE' ?
            <></>
            // dispatch(signInEmployee())
            // <SelectMode
            //   employeeModeSelected={ () => dispatch(signInEmployee()) }
            //   customerModeSelected={ () => dispatch(signInCustomer()) }
            // />
            : loginStage === 'CUSTOMER' ? <Navigate to="/customer" />
              : loginStage === 'EMPLOYEE' ? <Navigate to="/employee/dashboard" />
                : loginStage === 'CREATE_CUSTOMER_ACCOUNT' ? <CreateCustomerAccount onCancel={() => dispatch(selectMode())} />
                  : loginStage === 'SIGN_IN_EMPLOYEE' ?
                    <SignInSignUp
                      checkCredentials={(userName, password) => post('user/signin', { userName, password, employeeMode: true })}
                      // bottomDecorator={ () => <Typography align="center">Вернуться в<Button onClick={ () => dispatch(selectMode()) }>начало</Button></Typography> }
                    />
                    :
                    <SignInSignUp
                      checkCredentials={(userName, password) => post('user/signin', { userName, password })}
                      newPassword={(email) => post('user/forgot-password', { email })}
                      bottomDecorator={() =>
                        <Stack direction="column">
                          <Typography align="center">Создать новую<Button onClick={() => dispatch(createCustomerAccount())}>учетную запись</Button></Typography>
                          <Divider />
                          <Typography align="center">Вернуться в<Button onClick={() => dispatch(selectMode())}>начало</Button></Typography>
                        </Stack>
                      }
                    />
      }
    </Stack>;

  return result;
};
