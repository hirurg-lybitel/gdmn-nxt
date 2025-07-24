import { Captcha, CheckCode, CreateCode, SignInSignUp } from '@gsbelarus/ui-common-dialogs';
import axios from 'axios';
import type { AxiosError, AxiosRequestConfig } from 'axios';
import { IAuthResult, IUserProfile, ColorMode, ISessionInfo, UserType } from '@gsbelarus/util-api-types';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from './store';
import { queryLogin, selectMode, signedInCustomer, signedInEmployee, signInEmployee, createCustomerAccount, UserState, renderApp, signIn2fa, create2fa, checkCaptcha, signedInTicketsUser, changePassword } from './features/user/userSlice';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Divider, Typography, Stack, useTheme } from '@mui/material';
import CreateCustomerAccount from './create-customer-account/create-customer-account';
import { Navigate, useNavigate } from 'react-router-dom';
import { CircularIndeterminate } from '@gdmn-nxt/helpers/circular-indeterminate/circular-indeterminate';
import { InitData } from './store/initData';
import { setAppOptions, setColorMode } from './store/settingsSlice';
import { baseUrlApi } from './constants';
import { saveFilterData } from './store/filtersSlice';
import { getPublicIP } from '@gdmn-nxt/ip-info';
import bowser from 'bowser';
import ChangePassword from './components/change-password/change-password';

const query = async <T = IAuthResult>(config: AxiosRequestConfig<any>): Promise<T> => {
  try {
    return (await axios(config)).data;
  } catch (error: any) {
    const { response, request, message } = error as AxiosError;

    if (response) {
      return { result: 'ERROR', message: error.message } as T;
    } else if (request) {
      return { result: 'ERROR', message: `Can't reach server ${baseUrlApi}: ${message}` } as T;
    } else {
      return { result: 'ERROR', message: error.message } as T;
    }
  }
};

export interface AppProps { }

export default function App(props: AppProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { loginStage, userProfile } = useSelector<RootState, UserState>(state => state.user);

  /** Загрузка данных на фоне во время авторизации  */
  InitData();

  const [captchaImage, setCaptchaImage] = useState('');

  const navigate = useNavigate();

  const handleRegenerateCaptcha = async () => {
    const dataCaptcha = await get<string>('captcha');
    setCaptchaImage(dataCaptcha);
  };

  const pathName: string[] = window.location.pathname.split('/');
  pathName.splice(0, 1);

  // Поиск и установка id страницы, который соответствует url, в state
  type User = IUserProfile & UserState;
  const [user, setUser] = useState<User>();

  useEffect(() => {
    (async function () {
      switch (loginStage) {
        case 'SELECT_MODE':
          dispatch(setColorMode(ColorMode.Light));
          if (pathName[0] === 'tickets') {
            navigate('/tickets/login');
            break;
          };
          navigate('/');
          break;
        case 'LAUNCHING':
          // приложение загружается
          // здесь мы можем разместить код, который еще
          // до первой связи с сервером необходимо выполнить
          dispatch(queryLogin());
          break;

        case 'QUERY_LOGIN': {
          const response = await fetch(`${baseUrlApi}user`, { method: 'GET', credentials: 'include' });
          if (!response.ok) {
            dispatch(selectMode());
            return;
          }

          const data = await response.json();

          if (!data.result) {
            dispatch(selectMode());
            return;
          }

          setUser(data.user);

          navigate('/');

          /** Получение последнего url клиента */
          const res = await fetch(`${baseUrlApi}filters/menu`, { method: 'GET', credentials: 'include' });
          if (res.ok) {
            const pathnameData = await res.json();


            const pathname = Array.isArray(pathnameData.queries?.filters) ? pathnameData.queries.filters[0]?.filters?.path : '';
            dispatch(saveFilterData({ menu: { path: pathname } }));
          }

          const colorMode = data.user.colorMode ?? ColorMode.Dark;
          switch (colorMode) {
            case ColorMode.Dark:
              dispatch(setColorMode(ColorMode.Dark));
              break;
            case ColorMode.Light:
              dispatch(setColorMode(ColorMode.Light));
              break;
            default:
              dispatch(setColorMode(ColorMode.Light));
              break;
          }

          dispatch(setAppOptions({ saveFilters: data.user.saveFilters }));

          break;
        }
        case 'OTHER_LOADINGS': {
          dispatch(renderApp());
          break;
        }
      }
    })();
  }, [loginStage]);

  /** Wait for new color mod was applied */
  const theme = useTheme();
  useEffect(() => {
    if (loginStage === 'QUERY_LOGIN' && theme.palette.mode === user?.colorMode && !!user) {
      if (user.type === UserType.Tickets) {
        dispatch(signedInTicketsUser({ ...user }));
        return;
      }
      if (user.type === UserType.Gedemin) {
        dispatch(signedInEmployee({ ...user }));
        return;
      }
      dispatch(signedInCustomer({ userName: user.userName, id: user.id, contactkey: user.contactkey }));
    }
  }, [dispatch, loginStage, theme.palette.mode, user]);


  useEffect(() => {
    if (loginStage === 'SELECT_MODE') dispatch(signInEmployee());
  }, [loginStage]);

  const handleSignIn = useCallback(async ({ type = UserType.Gedemin, userName, password, email }: { type?: UserType, userName: string, password: string, email?: string; }) => {
    const loginData: Pick<ISessionInfo, 'ip' | 'device'> = { ip: 'unknown' };
    const browser = bowser.parse(window.navigator.userAgent);

    loginData.ip = await getPublicIP();
    loginData.device = {
      os: {
        name: browser?.os?.name ?? 'Не определено',
        version: browser?.os?.version
      },
      browser: {
        name: browser?.browser?.name ?? 'Не определено',
        version: browser?.browser?.version
      }
    };

    const response = await post('user/signin', {
      userName,
      password,
      type,
      ...(email && { email }),
      ...loginData
    });

    if (response.result === 'SUCCESS') {
      dispatch(queryLogin());
    };

    if (response.result === 'ONE_TIME_PASSWORD') {
      dispatch(changePassword({ ...userProfile, userName, password }));
    }

    if (response.result === 'REQUIRED_2FA') {
      const dataCreate2fa = await get('user/create-2fa');
      if (!dataCreate2fa.userProfile?.email) {
        dispatch(selectMode());
      } else {
        dispatch(create2fa({ ...dataCreate2fa.userProfile, userName, password }));
      }
    };

    if (response.result === 'REQUIRED_CAPTCHA') {
      const dataCaptcha = await get<string>('captcha');
      dispatch(checkCaptcha({ ...userProfile, userName, password }));
      setCaptchaImage(dataCaptcha);
    }

    if (response.result === 'ENABLED_2FA') {
      dispatch(signIn2fa({ ...userProfile, userName, password, ...loginData }));
    };

    return response;
  }, [dispatch, userProfile]);

  const handleSignInWithEmail = useCallback(
    (email: string) => handleSignIn({ userName: userProfile?.userName ?? '', password: userProfile?.password ?? '', email }),
    [handleSignIn, userProfile?.password, userProfile?.userName]
  );

  const backToMain = useCallback(async () => {
    dispatch(selectMode());
  }, [dispatch]);

  const create2FAOnSubmit = useCallback(async (authCode: string, emailCode: string): Promise<IAuthResult> => {
    const response = await post('user/create-2fa', { authCode, emailCode });

    if (response.result === 'SUCCESS') {
      handleSignIn({
        userName: userProfile?.userName ?? '',
        password: userProfile?.password ?? '',
      });
    };

    return response;
  }, [handleSignIn, userProfile?.password, userProfile?.userName]);

  const check2FAOnSubmit = useCallback(async (authCode: string): Promise<IAuthResult> => {
    const response = await post('user/signin-2fa', {
      authCode,
      userName: userProfile?.userName ?? '',
      password: userProfile?.password ?? '',
      employeeMode: true,
    });

    if (response.result === 'SUCCESS') {
      dispatch(queryLogin());
    };

    return response;
  }, [dispatch, userProfile?.password, userProfile?.userName]);

  const handleChangePassword = useCallback(async (newPassword: string, repeatPassword: string) => {
    const response = await post('user/change-password', {
      password: userProfile?.password ?? '',
      newPassword,
      repeatPassword
    });
    if (response.result === 'SUCCESS') {
      handleSignIn({
        type: UserType.Tickets,
        userName: userProfile?.userName ?? '',
        password: newPassword ?? ''
      });
      return { result: true };
    };
    return { result: false, message: response.message };
  }, [handleSignIn, userProfile?.password, userProfile?.userName]);

  const captchaSubmit = useCallback(async (value: string): Promise<boolean> => {
    const response = await post('captcha/verify', { value });

    if (response.result === 'SUCCESS') {
      setCaptchaImage('');
      handleSignIn({
        userName: userProfile?.userName ?? '',
        password: userProfile?.password ?? ''
      });
      return true;
    };
    return false;
  }, [handleSignIn, userProfile?.password, userProfile?.userName]);

  const captchaCancel = useCallback(() => {
    setCaptchaImage('');

    dispatch(signInEmployee());
  }, [dispatch]);

  const loadingPage = useMemo(() => {
    return (
      <Stack spacing={2}>
        <CircularIndeterminate open={true} size={100} />
        <Typography
          variant="overline"
          color="gray"
          align="center"
        >
          подключение
        </Typography>
      </Stack>
    );
  }, []);

  const renderLoginStage = useMemo(() => {
    switch (loginStage) {
      case 'LAUNCHING':
        return loadingPage;
      case 'OTHER_LOADINGS':
        return loadingPage;
      case 'SELECT_MODE':
        return loadingPage;
      case 'CUSTOMER':
        return <Navigate to="/customer" />;
      case 'EMPLOYEE':
        return <Navigate to="/employee/dashboard" />;
      case 'TISCKETS': {
        return <Navigate to="/tickets/tickets" />;
      }
      case 'CREATE_CUSTOMER_ACCOUNT':
        return <CreateCustomerAccount onCancel={() => dispatch(selectMode())} />;
      case 'SIGN_IN_EMPLOYEE':
      case 'CAPTCHA':
        return (
          <>
            <SignInSignUp
              // checkCredentials={handleCheckCredentials}
              onSignIn={handleSignIn}
            />
            <Captcha
              regenerate={handleRegenerateCaptcha}
              image={captchaImage}
              onSubmit={captchaSubmit}
              onCancel={captchaCancel}
            />
          </>
        );
      case 'SIGN_IN_CUSTOMER':
      case 'CAPTCHA':
        return (
          <SignInSignUp
            onSignIn={({ userName, password }) => post('user/signin', { userName, password })}
            newPassword={(email) => post('user/forgot-password', { email })}
            // onSignIn={handleSignIn}
            bottomDecorator={() =>
              <Stack direction="column">
                <Typography align="center">
                  Создать новую
                  <Button onClick={() => dispatch(createCustomerAccount())}>
                    учетную запись
                  </Button>
                </Typography>
                <Divider />
                <Typography align="center">
                  Вернуться в
                  <Button onClick={() => dispatch(selectMode())}>
                    начало
                  </Button>
                </Typography>
              </Stack>
            }
          />
        );
      case 'CREATE_2FA':
      case 'SET_EMAIL':
        return <CreateCode
          user={userProfile}
          onSubmit={create2FAOnSubmit}
          onCancel={backToMain}
          onSignIn={handleSignInWithEmail}
        />;
      case 'SIGN_IN_2FA':
        return <CheckCode
          onSubmit={check2FAOnSubmit}
          onCancel={backToMain}
        />;
      case 'ONE_TIME_PASSWORD':
        return <ChangePassword onSubmit={handleChangePassword} />;
      default:
        return loadingPage;
    }
  }, [loginStage, loadingPage, handleSignIn, captchaImage, captchaSubmit, captchaCancel, userProfile, create2FAOnSubmit, backToMain, handleSignInWithEmail, check2FAOnSubmit, handleChangePassword, dispatch]);

  const result =
    <div
      style={{
        display: 'grid',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'auto',
        padding: '12px 0'
      }}
    >
      <div>
        {renderLoginStage}
      </div>
    </div>;
  return result;
};

const post = (url: string, data: Object) => query({ method: 'post', url, baseURL: baseUrlApi, data, withCredentials: true });
const get = <T = IAuthResult>(url: string) => query<T>({ method: 'get', url, baseURL: baseUrlApi, withCredentials: true });
