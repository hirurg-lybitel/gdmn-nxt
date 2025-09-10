import Button from '@mui/material/Button/Button';
import Stack from '@mui/material/Stack/Stack';
import TextField from '@mui/material/TextField/TextField';
import Typography from '@mui/material/Typography/Typography';
import { useCallback, useMemo, useReducer, useState } from 'react';
import './sign-in-sign-up.module.less';
import { IAuthResult, UserType } from '@gsbelarus/util-api-types';
import { checkEmailAddress } from '@gsbelarus/util-useful';
import { MathCaptcha } from '../math-captcha/math-captcha';
import { Alert, LinearProgress, Dialog, InputAdornment, Theme, IconButton, Box, Link } from '@mui/material';
import { makeStyles } from '@mui/styles';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import VisibilityOnIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const useStyles = makeStyles((theme: Theme) => ({
  input: {
    '&:-webkit-autofill': {
      WebkitBoxShadow: '0 0 0 1000px white inset',
    }
  },
  visibilityPassword: {
    marginRight: '-10px'
  }

}));

type Stage = 'SIGNIN' | 'SIGNUP' | 'FORGOT_PASSWORD';

export interface SignInSignUpProps {
  onSignIn: (params: { type: UserType, userName: string, password: string; }) => Promise<IAuthResult>;
  /**
   * Если call-back для создания пользователя не задан, то в окне будет отключен
   * функционал создания новой учетной записи.
   */
  createUser?: (userName: string, email: string) => Promise<IAuthResult>;
  newPassword?: (email: string) => Promise<IAuthResult>;
  topDecorator?: (stage?: Stage) => JSX.Element;
  bottomDecorator?: (stage?: Stage) => JSX.Element;
  checkCredentials?: () => void;
  ticketsUser: boolean;
};

type State = {
  stage: Stage;
  waiting: boolean;
  userName: string;
  password: string;
  email: string;
  email2: string;
  authResult?: IAuthResult;
  captchaPassed: boolean;
};

const initialState: State = {
  stage: 'SIGNIN',
  waiting: false,
  userName: '',
  password: '',
  email: '',
  email2: '',
  captchaPassed: false
};

type Action = { type: 'SET_USERNAME', userName: string; }
  | { type: 'SET_PASSWORD', password: string; }
  | { type: 'SET_EMAIL', email: string; }
  | { type: 'SET_EMAIL2', email2: string; }
  | { type: 'SET_AUTHRESULT', authResult: IAuthResult; }
  | { type: 'CLEAR_AUTHRESULT'; }
  | { type: 'SET_STAGE', stage: State['stage']; }
  | { type: 'SET_WAITING'; }
  | { type: 'SET_CAPTCHAPASSED', captchaPassed: boolean; };

function reducer(state: State, action: Action): State {
  if (state.waiting && action.type !== 'SET_AUTHRESULT') {
    throw new Error(`Invalid action ${action.type} received.`);
  };

  switch (action.type) {
    case 'SET_USERNAME':
      return { ...state, userName: action.userName, authResult: undefined };
    case 'SET_PASSWORD':
      return { ...state, password: action.password, authResult: undefined };
    case 'SET_EMAIL':
      return { ...state, email: action.email, authResult: undefined };
    case 'SET_EMAIL2':
      return { ...state, email2: action.email2, authResult: undefined };
    case 'SET_AUTHRESULT':
      return { ...state, authResult: action.authResult, waiting: false };
    case 'CLEAR_AUTHRESULT':
      return { ...state, authResult: undefined };
    case 'SET_STAGE':
      return { ...state, stage: action.stage, authResult: undefined };
    case 'SET_WAITING':
      return { ...state, waiting: true };
    case 'SET_CAPTCHAPASSED':
      return state.captchaPassed !== action.captchaPassed ? { ...state, captchaPassed: action.captchaPassed } : state;
  }
};

export function SignInSignUp({
  checkCredentials,
  createUser,
  newPassword,
  topDecorator,
  bottomDecorator,
  onSignIn,
  ticketsUser
}: Readonly<SignInSignUpProps>) {
  const [{ stage, userName, password, email, email2, authResult, captchaPassed, waiting }, dispatch] = useReducer(reducer, initialState);

  const classes = useStyles();

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [launching, setLaunching] = useState(false);

  const waitAndDispatch = (fn: () => Promise<IAuthResult>) => () => {
    dispatch({ type: 'SET_WAITING' });
    fn().then(r => dispatch({ type: 'SET_AUTHRESULT', authResult: r }));
  };

  const doSignIn = useCallback(async () => {
    setLaunching(true);
    const type = ticketsUser ? UserType.Tickets : UserType.Gedemin;
    const res = await onSignIn({ type, userName, password });
    dispatch({ type: 'SET_AUTHRESULT', authResult: res });
    setLaunching(false);
  }, [onSignIn, password, ticketsUser, userName]);

  const keyPress = useCallback(async (e: any) => {
    if (e.keyCode === 13) {
      await doSignIn();
    }
  }, [doSignIn]);

  const result = useMemo(() => {
    if (stage === 'FORGOT_PASSWORD') {
      return (
        <Stack direction="column" spacing={2}>
          {topDecorator?.(stage)}
          <TextField
            label="Email"
            value={email}
            error={authResult?.result === 'INVALID_EMAIL' || authResult?.result === 'UNKNOWN_USER'}
            helperText={authResult?.result === 'INVALID_EMAIL' || authResult?.result === 'UNKNOWN_USER' ? authResult?.message : undefined}
            disabled={waiting}
            autoFocus
            onChange={e => dispatch({ type: 'SET_EMAIL', email: e.target.value.replace(/\s/g, '') })}
          />
          <Button
            variant="contained"
            disabled={waiting || !!authResult || !checkEmailAddress(email)}
            onClick={newPassword && waitAndDispatch(() => newPassword(email))}
          >
            Request new Password
          </Button>
          <Button
            variant="outlined"
            disabled={waiting}
            onClick={() => dispatch({ type: 'SET_STAGE', stage: 'SIGNIN' })}
          >
            Return to sign in
          </Button>
          {bottomDecorator?.(stage)}
        </Stack>
      );
    }

    if (stage === 'SIGNUP') {
      return (
        < Stack direction="column" spacing={2} >
          {topDecorator?.(stage)}
          <Typography variant="h6">
            New user
          </Typography>
          <TextField
            label="Пользователь"
            value={userName}
            disabled={waiting}
            autoFocus
            error={authResult?.result === 'DUPLICATE_USER_NAME'}
            helperText={authResult?.result === 'DUPLICATE_USER_NAME' ? authResult?.message : undefined}
            onChange={e => dispatch({ type: 'SET_USERNAME', userName: e.target.value })}
          />
          <TextField
            label="Email"
            value={email}
            disabled={waiting}
            error={(email > '' && !checkEmailAddress(email)) || authResult?.result === 'DUPLICATE_EMAIL'}
            helperText={authResult?.result === 'DUPLICATE_EMAIL' ? authResult?.message : undefined}
            onChange={e => dispatch({ type: 'SET_EMAIL', email: e.target.value })}
          />
          <TextField
            label="Retype email"
            value={email2}
            disabled={waiting}
            error={email2 > '' && email2 !== email}
            onChange={e => dispatch({ type: 'SET_EMAIL2', email2: e.target.value })}
          />
          <MathCaptcha
            disabled={waiting}
            onEnter={captchaPassed => dispatch({ type: 'SET_CAPTCHAPASSED', captchaPassed })}
          />;
          {
            waiting ?
              <Box sx={{ padding: 2, border: 1, borderColor: 'grey.50', borderRadius: 1 }}>
                <LinearProgress />
              </Box>
              :
              <Button
                variant="contained"
                disabled={waiting || !userName || !checkEmailAddress(email) || email !== email2 || !captchaPassed || !!authResult}
                onClick={createUser && waitAndDispatch(() => createUser(userName, email))}
              >
                Sign up
              </Button>
          }
          <Typography>
            Already have an account? <Button disabled={waiting} onClick={() => dispatch({ type: 'SET_STAGE', stage: 'SIGNIN' })}>Sign in</Button>
          </Typography>;
          {bottomDecorator?.(stage)}
        </Stack >
      );
    }

    const loginForm = (ticketsLogin: boolean) => {
      return (
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Stack
            direction="column"
            spacing={3}
            sx={{
              width: { xs: '100%', sm: ticketsLogin ? 400 : 360 },
              maxWidth: '100%',
              padding: { xs: 2.5, sm: 4 },
              backgroundColor: 'background.paper',
              borderRadius: 2,
              boxShadow: (theme) => theme.shadows[3],
              transition: 'box-shadow 0.3s ease-in-out',
              '&:hover': {
                boxShadow: (theme) => theme.shadows[8]
              }
            }}
          >
            {topDecorator?.(stage)}
            <Box textAlign="center">
              <Typography
                variant="h4"
                fontWeight={700}
                sx={{
                  color: 'primary.main',
                  mb: 1,
                  fontSize: { xs: '1.75rem', sm: '2rem' }
                }}
              >
                {ticketsLogin ? 'Вход в тикет систему' : 'Вход в систему'}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ opacity: 0.8 }}
              >
                Введите свои учётные данные для входа
              </Typography>
            </Box>
            <TextField
              fullWidth
              label="Пользователь"
              value={userName}
              error={authResult?.result === 'UNKNOWN_USER'}
              helperText={authResult?.result === 'UNKNOWN_USER' ? authResult?.message : undefined}
              disabled={waiting}
              autoFocus
              onChange={e => dispatch({ type: 'SET_USERNAME', userName: e.target.value })}
              onKeyDown={keyPress}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountCircleIcon color="action" sx={{ opacity: 0.7 }} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Пароль"
              type={passwordVisible ? 'text' : 'password'}
              error={authResult?.result === 'INVALID_PASSWORD'}
              helperText={authResult?.result === 'INVALID_PASSWORD' ? authResult?.message : undefined}
              disabled={waiting}
              onChange={e => dispatch({ type: 'SET_PASSWORD', password: e.target.value })}
              onKeyDown={keyPress}
              autoComplete="false"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <VpnKeyIcon color="action" sx={{ opacity: 0.7 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      edge="end"
                      sx={{
                        opacity: 0.7,
                        '&:hover': { opacity: 1 }
                      }}
                    >
                      {passwordVisible ? <VisibilityOnIcon /> : <VisibilityOffIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              size="large"
              disabled={waiting || !userName || !password || launching}
              onClick={doSignIn}
              sx={{
                py: 1.25,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                boxShadow: 'none',
                transition: 'all 0.2s ease-in-out',
                width: '100%'
              }}
            >
              {launching ? 'Входим...' : 'Войти'}
            </Button>
            {
              newPassword
              &&
              <Button
                variant="outlined"
                disabled={waiting}
                onClick={() => dispatch({ type: 'SET_STAGE', stage: 'FORGOT_PASSWORD' })}
              >
                Забыли пароль?
              </Button>
            }
            {
              createUser
              &&
              <Typography>
                {'Don\'t have an account?'} <Button disabled={waiting} onClick={() => dispatch({ type: 'SET_STAGE', stage: 'SIGNUP' })}>Sign up</Button>
              </Typography>
            }
            {bottomDecorator?.(stage)}
          </Stack>
        </div>
      );
    };

    return loginForm(ticketsUser);
  }, [authResult, bottomDecorator, captchaPassed, createUser, doSignIn, email, email2, keyPress, launching, newPassword, password, passwordVisible, stage, topDecorator, userName, waiting]);

  return (
    <>
      {result}
      <Dialog onClose={() => dispatch({ type: 'CLEAR_AUTHRESULT' })} open={authResult?.result === 'ERROR'} >
        <Alert severity="error" style={{ alignItems: 'center' }}><Typography variant="subtitle1">{authResult?.message}</Typography></Alert>
      </Dialog>
      <Dialog onClose={() => dispatch({ type: 'SET_STAGE', stage: 'SIGNIN' })} open={authResult?.result === 'SUCCESS_USER_CREATED'} >
        <Alert severity="success" style={{ alignItems: 'center' }}><Typography variant="subtitle1">{authResult?.message}</Typography></Alert>
      </Dialog>
      <Dialog onClose={() => dispatch({ type: 'SET_STAGE', stage: 'SIGNIN' })} open={authResult?.result === 'SUCCESS_PASSWORD_CHANGED'} >
        <Alert severity="success" style={{ alignItems: 'center' }}><Typography variant="subtitle1">{authResult?.message}</Typography></Alert>
      </Dialog>
      <Dialog onClose={() => dispatch({ type: 'SET_STAGE', stage: 'SIGNIN' })} open={authResult?.result === 'SUCCESS'} >
        <Alert severity="success" style={{ alignItems: 'center' }}><Typography>{authResult?.message}</Typography></Alert>
      </Dialog>
    </>
  );
};

export default SignInSignUp;
