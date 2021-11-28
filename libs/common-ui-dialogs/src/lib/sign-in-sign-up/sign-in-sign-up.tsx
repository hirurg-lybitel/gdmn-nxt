import Button from '@mui/material/Button/Button';
import Stack from '@mui/material/Stack/Stack';
import TextField from '@mui/material/TextField/TextField';
import Typography from '@mui/material/Typography/Typography';
import { useState } from 'react';
import './sign-in-sign-up.module.less';

/* eslint-disable-next-line */
export interface SignInSignUpProps {}

export function SignInSignUp(props: SignInSignUpProps) {

  const [signUp, setSignUp] = useState(false);
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');

  return (
    signUp ?
      <Stack direction="column" spacing={1}>
        SignUp
        <Typography>
          Already have an account? <Button onClick={ () => setSignUp(false) }>Sign in</Button>
        </Typography>
      </Stack>
    :
      <Stack direction="column" spacing={1}>
        <TextField
          label="User name"
          value={userName}
          onChange={ e => setUserName(e.target.value) }
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={ e => setPassword(e.target.value) }
        />
        <Button variant="contained" disabled={!userName || !password}>
          Login
        </Button>
        <Button variant="outlined">
          Forgot password?
        </Button>
        <Typography>
          Don't have an account? <Button onClick={ () => setSignUp(true) }>Sign up</Button>
        </Typography>
      </Stack>
  );
}

export default SignInSignUp;
