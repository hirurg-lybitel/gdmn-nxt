import { IAuthResult } from '@gsbelarus/util-api-types';
import { Stack, Typography, Button, Dialog, Alert } from '@mui/material';
import { useReducer } from 'react';
import './logged-user.module.less';

export interface LoggedUserProps {
  logout: () => void;
  onDone: (userName: string) => void;
};

type State = {
  stage: 'HOME' | 'INFO';
  waiting: boolean;
  userName: string;
  isLogged: boolean;
  authResult?: IAuthResult;
};

const initialState: State = {
  stage: 'HOME',
  waiting: false,
  userName: '',
  isLogged: true
};

type Action = { type: 'SET_USERNAME', userName: string; }
  | { type: 'SET_AUTHRESULT', authResult: IAuthResult; }
  | { type: 'CLEAR_AUTHRESULT'; }
  | { type: 'SET_STAGE', stage: State['stage']; }
  | { type: 'SET_WAITING'; };

function reducer(state: State, action: Action): State {
  if (state.waiting && action.type !== 'SET_AUTHRESULT') {
    throw new Error(`Invalid action ${action.type} received.`);
  }

  switch (action.type) {
    case 'SET_USERNAME':
      return { ...state, userName: action.userName, authResult: undefined };
    case 'SET_AUTHRESULT':
      return { ...state, authResult: action.authResult, waiting: false };
    case 'CLEAR_AUTHRESULT':
      return { ...state, authResult: undefined };
    case 'SET_STAGE':
      return { ...state, stage: action.stage, authResult: undefined };
    case 'SET_WAITING':
      return { ...state, waiting: true };
  }
};

export function LoggedUser({ logout, onDone }: LoggedUserProps) {

  const [{ stage, userName, isLogged, authResult, waiting }, dispatch] = useReducer(reducer, initialState);

  const waitAndDispatch = (fn: () => Promise<IAuthResult>) => () => {
    dispatch({ type: 'SET_WAITING' });
    fn().then(r => dispatch({ type: 'SET_AUTHRESULT', authResult: r }));
  };

  const result =
    stage === 'HOME' ?
      <Stack direction='column' spacing={2}>
        <Typography variant='h1'>You are logged in as </Typography>
        <Button
          variant="contained"
          onClick={logout}>
          Logout
        </Button>
        <Button
          variant="contained"
          onClick={() => dispatch({ type: 'SET_STAGE', stage: 'INFO' })}>
          CHECK THE ACT
        </Button>
      </Stack>
      :
      <h1>INFO</h1>;
  return (
    <>
      {result}
      <Dialog onClose={() => dispatch({ type: 'CLEAR_AUTHRESULT' })} open={authResult?.result === 'ERROR'}>
        <Alert severity="error">{authResult?.message}</Alert>
      </Dialog>
    </>
  );
};

export default LoggedUser;
