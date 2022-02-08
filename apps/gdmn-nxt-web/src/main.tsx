import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom';

import App from './app/app';

import { RootState, store } from './app/store';
import { Provider, useSelector } from 'react-redux';
import { BrowserRouter, Route } from "react-router-dom";

import Routes from './app/routes'

// rename mui-license.ts.sample -> mui-license.ts
// put in bought license key
import { registerMUI } from './mui-license';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './app/theme';
import { UserState } from './app/features/user/userSlice';


registerMUI();

const Main = () => {
  const customization = useSelector((state: RootState) => state.settings.customization);
  const { loginStage } = useSelector<RootState, UserState>( state => state.user );
  const isLogged = (loginStage === 'CUSTOMER' || loginStage === 'EMPLOYEE')

  console.log('isLogged', isLogged);

  return (
    <BrowserRouter>
      <StrictMode>
        <ThemeProvider theme={theme(customization)}>
          <Routes isLogged={isLogged} />
        </ThemeProvider>
      </StrictMode>
    </BrowserRouter>
  );
}

ReactDOM.render(
  <Provider store={store}>
    <Main />
  </Provider>,
  document.getElementById('root')
);
