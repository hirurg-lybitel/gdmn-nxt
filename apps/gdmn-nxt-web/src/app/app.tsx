import styles from './app.module.less';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { SignInSignUp } from '@gsbelarus/ui-common-dialogs';
import axios from 'axios';
import type { AxiosError } from 'axios';
import { IAuthResult } from '@gsbelarus/util-api-types';

const baseURL = 'http://localhost:4444';

const axiosPost = async (url: string, data: Object): Promise<IAuthResult> => {
  try {
    return (await axios({ method: 'post', url, baseURL, data })).data;
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

export function App() {
  return (
    <div className={styles.app}>
      <SignInSignUp
        checkCredentials = { () => Promise.resolve({ result: 'UNKNOWN_USER', message: 'User not found' }) }
        createUser = { (userName, email) => axiosPost('/api/v1/user/signup', { userName, email }) }
        onDone = { () => {} }
      />
    </div>
  );
}

export default App;