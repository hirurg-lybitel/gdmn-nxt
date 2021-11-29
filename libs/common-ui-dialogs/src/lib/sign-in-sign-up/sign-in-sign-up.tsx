import Button from '@mui/material/Button/Button';
import Stack from '@mui/material/Stack/Stack';
import TextField from '@mui/material/TextField/TextField';
import Typography from '@mui/material/Typography/Typography';
import { useReducer } from 'react';
import './sign-in-sign-up.module.less';

export interface AuthResult {
  result: 'SUCCESS' | 'UNKNOWN_USER' | 'INVALID_PASSWORD' | 'INVALID_EMAIL' | 'ACCESS_DENIED' | 'SERVER_UNAVAILABLE' | 'ERROR';
  message?: string;
};

export interface SignInSignUpProps {
  checkCredentials: (userName: string, password: string) => Promise<AuthResult>;
};

type State = {
  stage: 'SIGNIN' | 'SIGNUP' | 'FORGOT_PASSWORD';
  userName: string;
  password: string;
  email: string;
  authResult?: AuthResult;
};

const initialState: State = {
  stage: 'SIGNIN',
  userName: '',
  password: '',
  email: ''
};

type Action = { type: 'SET_USERNAME', userName: string }
  | { type: 'SET_PASSWORD', password: string }
  | { type: 'SET_EMAIL', email: string }
  | { type: 'SET_AUTHRESULT', authResult: AuthResult }
  | { type: 'SET_STAGE', stage: State['stage'] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_USERNAME':
      return { ...state, userName: action.userName, authResult: undefined };
    case 'SET_PASSWORD':
      return { ...state, password: action.password, authResult: undefined };
    case 'SET_EMAIL':
      return { ...state, email: action.email, authResult: undefined };
    case 'SET_AUTHRESULT':
      return { ...state, authResult: action.authResult };
    case 'SET_STAGE':
      return { ...state, stage: action.stage, authResult: undefined };
  }
};

export function SignInSignUp({ checkCredentials }: SignInSignUpProps) {

  const [{ stage, userName, password, email, authResult }, dispatch] = useReducer(reducer, initialState);

  return (
    stage === 'FORGOT_PASSWORD' ?
      <Stack direction="column" spacing={2}>
        <TextField
          label="Email"
          value={email}
          error={authResult?.result === 'INVALID_EMAIL'}
          helperText={authResult?.result === 'INVALID_EMAIL' ? (authResult?.message ?? 'Unknown email') : undefined}
          onChange={ e => dispatch({ type: 'SET_EMAIL', email: e.target.value }) }
        />
        <Button
          variant="contained"
          disabled={!email || !!authResult}
          onClick={ () => checkCredentials(userName, password).then( r => dispatch({ type: 'SET_AUTHRESULT', authResult: r }) ) }
        >
          Login
        </Button>
        <Button variant="outlined" onClick={ () => dispatch({ type: 'SET_STAGE', stage: 'SIGNIN' }) }>
          Return to sign in
        </Button>
      </Stack>
    : stage === 'SIGNUP' ?
      <Stack direction="column" spacing={2}>
        SignUp
        <Typography>
          Already have an account? <Button onClick={ () => dispatch({ type: 'SET_STAGE', stage: 'SIGNIN' }) }>Sign in</Button>
        </Typography>
      </Stack>
    :
      <Stack direction="column" spacing={2}>
        <TextField
          label="User name"
          value={userName}
          error={authResult?.result === 'UNKNOWN_USER'}
          helperText={authResult?.result === 'UNKNOWN_USER' ? (authResult?.message ?? 'Unknown user name') : undefined}
          onChange={ e => dispatch({ type: 'SET_USERNAME', userName: e.target.value }) }
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          error={authResult?.result === 'INVALID_PASSWORD'}
          helperText={authResult?.result === 'INVALID_PASSWORD' ? (authResult?.message ?? 'Invalid password') : undefined}
          onChange={ e => dispatch({ type: 'SET_PASSWORD', password: e.target.value }) }
        />
        <Button
          variant="contained"
          disabled={!userName || !password || !!authResult}
          onClick={ () => checkCredentials(userName, password).then( r => dispatch({ type: 'SET_AUTHRESULT', authResult: r }) ) }
        >
          Login
        </Button>
        <Button variant="outlined" onClick={ () => dispatch({ type: 'SET_STAGE', stage: 'FORGOT_PASSWORD' }) }>
          Forgot password?
        </Button>
        <Typography>
          Don't have an account? <Button onClick={ () => dispatch({ type: 'SET_STAGE', stage: 'SIGNUP' }) }>Sign up</Button>
        </Typography>
      </Stack>
  );
}

export default SignInSignUp;
