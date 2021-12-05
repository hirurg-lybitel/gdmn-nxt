import styles from './app.module.less';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { SignInSignUp } from '@gsbelarus/ui-common-dialogs';
import axios, { AxiosResponse } from 'axios';
import type { AxiosError } from 'axios';
import { IAuthResult } from '@gsbelarus/util-api-types';

const baseURL = 'http://unexistingserver.net';

const axiosPost = async (url: string, data: Object, cb: (res: AxiosResponse) => Promise<IAuthResult>): Promise<IAuthResult> => {
  try {
    return cb(await axios({ method: 'post', url, baseURL, data }));
  }
  catch (error: any) {
    const { response, request, message } = error as AxiosError;

    if (response) {

    }
    else if (request) {
      await new Promise( resolve => setTimeout( resolve, 4000 ));
      return { result: 'ERROR', message: `Can't reach server ${baseURL}: ${message}` };
    }
    else {

    }

    console.log(error.message);
    return { result: 'ERROR', message };
  }
};

export function App() {
  return (
    <div className={styles.app}>
      <SignInSignUp
        checkCredentials = { () => Promise.resolve({ result: 'UNKNOWN_USER', message: 'User not found' }) }
        createUser = {
          async (userName, email) => axiosPost('/v1/user/register', { userName, email }, () => Promise.resolve({ result: 'UNKNOWN_USER', message: 'User not found' }) )
        }
      />
    </div>
  );
}

export default App;