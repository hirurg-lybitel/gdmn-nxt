import { StrictMode, useEffect, useRef } from 'react';
import * as ReactDOM from 'react-dom';

import { RootState, store } from './app/store';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { BrowserRouter, json, Navigate, Route, Routes } from 'react-router-dom';

// rename mui-license.ts.sample -> mui-license.ts
// put in bought license key
import { registerMUI } from './mui-license';
import { Theme, ThemeProvider, useTheme } from '@mui/material/styles';
import { theme } from './app/theme';
import { LoginStage } from './app/features/user/userSlice';
import { MainLayout } from './app/layouts/MainLayout';
import { ReconciliationAct } from './app/pages/Analytics/UserReports/ReconciliationAct';
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
import StandardOrder from './app/standard-order/standard-order';
import ReconciliationStatement from './app/reconciliation-statement/reconciliation-statement';
import Deals from './app/pages/Managment/deals/deals';
import SalesFunnel from './app/pages/Analytics/sales-funnel/sales-funnel';
import { ErModelDomains } from './app/er-model-domains/er-model-domains';
import BaseForm from './app/base-form/base-form';
import CustomerDetails from './app/pages/Customers/customer-details/customer-details';
import { NlpMain } from './app/nlp-main/nlp-main';
import { SqlEditor } from './app/components/System/sql-editor/sql-editor';
import CustomersMap from './app/customers/customers-map/customers-map';
import RemainsByInvoices from './app/pages/Analytics/UserReports/remains-by-invoices/remains-by-invoices';
import Labels from './app/pages/Managment/Lables';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ruLocale from 'date-fns/locale/ru';
import PermissionsList from './app/pages/Permissions/permissions-list/permissions-list';
import UserGroups from './app/pages/Permissions/user-groups/user-groups';
import TopEarningPage from './app/pages/Analytics/UserReports/TopEarningPage';
import Profile from './app/pages/Preferences/profile/profile';
import AccountSettings from './app/pages/Preferences/account-settings/account-settings';
import NotificationCenter from './app/pages/NotificationCenter/notification-center/notification-center';
import FAQ from './app/pages/FAQ/Index';
import { SnackbarProvider } from 'notistack';
import NotFound from './app/pages/NotFound';
import menuItems from './app/menu-items';
import { setActiveMenu, setPageIdFound, setStyleMode } from './app/store/settingsSlice';
import Analytics from './app/pages/Dashboard/analytics/analytics';
import { IMenuItem } from './app/menu-items';
import { useState } from 'react';
import { UserState } from './app/features/user/userSlice';
import { userInfo } from 'os';
import { join } from 'path';
import { useGetProfileSettingsQuery } from './app/features/profileSettings';
import DealSources from './app/pages/Managment/dealsCatalogs/deal-sources/deal-sources';
import DenyReasons from './app/pages/Managment/dealsCatalogs/deny-reasons/deny-reasons';
import { ColorMode } from '@gsbelarus/util-api-types';

registerMUI();

const Main = () => {
  const dispatch = useDispatch();
  const customization = useSelector((state: RootState) => state.settings.customization);
  const loginStage = useSelector<RootState, LoginStage>(state => state.user.loginStage);
  const [savedTheme, setSavedTheme] = useState<Theme>(theme(customization));
  const settings = useSelector((state: RootState) => state.settings);
  const pageIdFound = useSelector((state: RootState) => state.settings.pageIdFound);
  const themeStyles = useTheme();
  const user = useSelector<RootState, UserState>(state => state.user);
  const [actionCode, setActionCode] = useState<number>(-3);
  const { data, isFetching } = useGetPermissionByUserQuery(
    { actionCode, userID: user.userProfile?.id || -1 }, { skip: !user.userProfile?.id || actionCode < 1 }
  );
  useEffect(() => {
    setSavedTheme(theme(customization));
  }, [customization]);

  useEffect(()=>{
    if (!themeType || themeType !== 'dark') {
      return;
    }
    dispatch(setStyleMode('dark'));
  }, [themeType]);

  const pathName:string[] = window.location.pathname.split('/');
  pathName.splice(0, 1);
  // Поиск и установка id страницы, который соответствует url, в state
  useEffect(() => {
    if (pageIdFound || settings.activeMenuId === '' || pathName.length < 2) {
      return;
    }
    const flatMenuItems = (items: IMenuItem[]): IMenuItem[] =>
      items.map(item =>
        item.type === 'item'
          ? item
          : flatMenuItems(item.children || [])).flatMap(el => el);

    const flattedMenuItems = flatMenuItems(menuItems.items);
    const path = (pathName.filter((pathItem, index) => index !== 0 && pathItem)).join('/');
    const pageId = (flattedMenuItems.find(item => item.url === path))?.id;
    if (!pageId) {
      return;
    }
    dispatch(setPageIdFound(true));
    dispatch(setActiveMenu(pageId));
  }, [settings]);

  return (
    <div style={{ background: settings.customization.mode === 'dark' ? '#424242' : '', height: '100%' }}>
      <BrowserRouter>
        <StrictMode>
          <CssBaseline>
            <ThemeProvider theme={savedTheme}>
              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                localeText={{ start: 'Начало периода', end: 'Конец периода' }}
                adapterLocale={ruLocale}
              >
                <SnackbarProvider maxSnack={3}>
                  {
                    <>
                      {
                        loginStage === 'EMPLOYEE' ?
                          <Routes>
                            <Route path="/employee" element={<MainLayout />}>
                              <Route path="" element={<Navigate to="dashboard/overview" />} />
                              <Route path="dashboard">
                                <Route path="" element={<Navigate to="overview" />} />
                                <Route path="overview" element={<Dashboard />} />
                                <Route path="analytics" element={<Analytics />} />
                              </Route>
                              <Route path="managment">
                                <Route path="deals">
                                  <Route path="list" element={<Deals />} />
                                  <Route path="dealSources" element={<DealSources />} />
                                  <Route path="denyReasons" element={<DenyReasons />} />
                                </Route>
                                <Route path="customers" >
                                  <Route path="" element={<NotFound/>} />
                                  <Route path="orders/list" element={<OrderList />} />
                                  <Route path="list" element={<CustomersList />} />
                                  <Route path="list/details/:id" element={<CustomerDetails />} />
                                </Route>
                                <Route path="labels" element={<Labels />}/>
                              </Route>
                              <Route path="analytics">
                                <Route path="" element={<Navigate to="reports/reconciliation" />} />
                                <Route path="reports">
                                  <Route path="" element={<Navigate to="reconciliation" />} />
                                  <Route path="reconciliation" element={<ReconciliationAct />} />
                                  <Route path="reconciliation/:customerId" element={<ReconciliationAct />} />
                                  <Route path="remainbyinvoices" element={<RemainsByInvoices />} />
                                  <Route path="topEarning" element={<TopEarningPage />} />
                                </Route>
                                <Route path="salesfunnel" element={<SalesFunnel />} />
                              </Route>
                              <Route path="preferences">
                                <Route path="" element={<Navigate to="account" />} />
                                <Route path="account" element={<Profile />} />
                                <Route path="settings" element={<AccountSettings />} />
                                <Route path="permissions">
                                  <Route path="" element={<Navigate to="list" />} />
                                  <Route path="list" element={<PermissionsList />} />
                                  <Route path="usergroups" element={<UserGroups />} />
                                </Route>
                                <Route path="notifications" element={<NotificationCenter/>} />
                                <Route path="faq" element={<FAQ />} />
                              </Route>
                            </Route>
                            <Route path="/system" element={<BaseForm />}>
                              <Route path="" element={<Navigate to="er-model-domains" />} />
                              <Route path="er-model-domains" element={<ErModelDomains />} />
                              <Route path="er-model" element={<ErModel />} />
                              <Route path="nlp-main" element={<NlpMain />} />
                              <Route path="sql-editor" element={<SqlEditor />} />
                              <Route path="*" element={<NotFound/>} />
                            </Route>
                            <Route path="/" element={<Navigate to="/employee/dashboard" />} />
                            <Route path="*" element={<NotFound/>} />
                          </Routes>
                          : loginStage === 'CUSTOMER' ?
                            <Routes>
                              <Route path="/customer" element={<CustomerHomePage />}>
                                <Route path="" element={<Navigate to="standard-order" />} />
                                <Route path="standard-order" element={<StandardOrder />} />
                                <Route path="reconciliation-statement" element={<ReconciliationStatement custId={148333193} />} />
                              </Route>
                              <Route path="/" element={<Navigate to="/customer" />} />
                              <Route path="*" element={<NotFound/>} />
                            </Routes>
                            : <App />
                      }</>
                  }
                </SnackbarProvider>
              </LocalizationProvider>
            </ThemeProvider>
          </CssBaseline>
        </StrictMode>
      </BrowserRouter>
    </div>
  );
};

ReactDOM.render(
  <Provider store={store}>
    <Main />
  </Provider>,
  document.getElementById('root')
);
