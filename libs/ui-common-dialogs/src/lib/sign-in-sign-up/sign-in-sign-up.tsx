import Button from '@mui/material/Button/Button';
import Stack from '@mui/material/Stack/Stack';
import TextField from '@mui/material/TextField/TextField';
import Typography from '@mui/material/Typography/Typography';
import { useReducer } from 'react';
import './sign-in-sign-up.module.less';
import type { IAuthResult } from '@gsbelarus/util-api-types';
import { checkEmailAddress } from '../useful';

export interface SignInSignUpProps {
  checkCredentials: (userName: string, password: string) => Promise<IAuthResult>;
  createUser: (userName: string, email: string) => Promise<IAuthResult>;
};

type State = {
  stage: 'SIGNIN' | 'SIGNUP' | 'FORGOT_PASSWORD';
  userName: string;
  password: string;
  email: string;
  email2: string;
  authResult?: IAuthResult;
};

const initialState: State = {
  stage: 'SIGNIN',
  userName: '',
  password: '',
  email: '',
  email2: '',
};

type Action = { type: 'SET_USERNAME', userName: string }
  | { type: 'SET_PASSWORD', password: string }
  | { type: 'SET_EMAIL', email: string }
  | { type: 'SET_EMAIL2', email2: string }
  | { type: 'SET_AUTHRESULT', authResult: IAuthResult }
  | { type: 'SET_STAGE', stage: State['stage'] };

function reducer(state: State, action: Action): State {
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
      return { ...state, authResult: action.authResult };
    case 'SET_STAGE':
      return { ...state, stage: action.stage, authResult: undefined };
  }
};

export function SignInSignUp({ checkCredentials, createUser }: SignInSignUpProps) {

  const [{ stage, userName, password, email, email2, authResult }, dispatch] = useReducer(reducer, initialState);

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
          disabled={!email || !!authResult || !checkEmailAddress(email)}
          onClick={ () => checkCredentials(userName, password).then( r => dispatch({ type: 'SET_AUTHRESULT', authResult: r }) ) }
        >
          Sign in
        </Button>
        <Button variant="outlined" onClick={ () => dispatch({ type: 'SET_STAGE', stage: 'SIGNIN' }) }>
          Return to sign in
        </Button>
      </Stack>
    : stage === 'SIGNUP' ?
      <Stack direction="column" spacing={2}>
        <TextField
          label="User name"
          value={userName}
          onChange={ e => dispatch({ type: 'SET_USERNAME', userName: e.target.value }) }
        />
        <TextField
          label="Email"
          value={email}
          onChange={ e => dispatch({ type: 'SET_EMAIL', email: e.target.value }) }
        />
        <TextField
          label="Retype email"
          value={email2}
          onChange={ e => dispatch({ type: 'SET_EMAIL2', email2: e.target.value }) }
        />
        <Button
          variant="contained"
          disabled={!userName || !email || email !== email2}
          onClick={ () => createUser(userName, email).then( r => dispatch({ type: 'SET_AUTHRESULT', authResult: r }) ) }
        >
          Sign up
        </Button>
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
