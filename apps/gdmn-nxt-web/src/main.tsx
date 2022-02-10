import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom';

import { RootState, store } from './app/store';
import { Provider, useSelector } from 'react-redux';
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

// rename mui-license.ts.sample -> mui-license.ts
// put in bought license key
import { registerMUI } from './mui-license';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { theme } from './app/theme';
import { UserState } from './app/features/user/userSlice';
import { MainLayout } from './app/layouts/MainLayout';
import { ReconciliationAct } from './app/pages/UserReports/ReconciliationAct';
import { CustomersList } from './app/pages/Customers/customers-list/customers-list';
import { Dashboard } from './app/pages/Dashboard/dashboard/dashboard';
import { OrderList } from './app/pages/Customers/order-list/order-list';
import { ErModel } from './app/er-model/er-model';
import App from './app/app';
import CustomerHomePage from './app/customer-home-page/customer-home-page';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { CssBaseline } from '@mui/material';

registerMUI();

const myTheme = createTheme({
  typography: {
    h1: {
      fontSize: '1.5rem',
      fontWeight: 700
    }
  }
} as any);

const Main = () => {
  const customization = useSelector( (state: RootState) => state.settings.customization );
  const { loginStage } = useSelector<RootState, UserState>( state => state.user );

  return (
    <BrowserRouter>
      <StrictMode>
        <CssBaseline>
          <ThemeProvider theme={theme(customization)}>  
          {
            loginStage === 'EMPLOYEE' ?
              <Routes>
                <Route path="/employee" element={<MainLayout />}>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="customers/list" element={<CustomersList />} />
                  <Route path="customers/orders/list" element={<OrderList />} />
                  <Route path="reports/reconciliation" element={<ReconciliationAct />} />
                  <Route path="reports/reconciliation/:customerId" element={<ReconciliationAct />} />
                  <Route path="system/er-model" element={<ErModel />} />
                </Route>
                <Route path="*" element={<Navigate to="/employee/dashboard" />} />
              </Routes>
            : loginStage === 'CUSTOMER' ?
              <Routes>
                <Route path="/customer">
                  <Route path="home" element={<CustomerHomePage />} />
                </Route>  
                <Route path="*" element={<Navigate to="/customer/home" />} />
              </Routes>  
            :
              <Routes>
                <Route path="/" element={<App />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>  
          }
          </ThemeProvider>  
        </CssBaseline>
      </StrictMode>
    </BrowserRouter>
  );
};

ReactDOM.render(
  <Provider store={store}>
    <Main />
  </Provider>,
  document.getElementById('root')
);
