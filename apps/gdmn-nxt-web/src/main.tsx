import { StrictMode, useEffect, useRef } from 'react';
import * as ReactDOM from 'react-dom';

import { RootState, store } from './app/store';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { BrowserRouter, json, Navigate, Route, Routes } from 'react-router-dom';

// rename mui-license.ts.sample -> mui-license.ts
// put in bought license key
import { registerMUI } from './mui-license';
import { Theme, ThemeProvider } from '@mui/material/styles';
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
import Deals from './app/pages/Dashboard/deals/deals';
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
import { baseUrl } from './app/const';
import menuItems from './app/menu-items';
import { setActiveMenu, setPageIdFound } from './app/store/settingsSlice';
import Analytics from './app/pages/Dashboard/analytics/analytics';

registerMUI();

const Main = () => {
  const dispatch = useDispatch();
  const customization = useSelector((state: RootState) => state.settings.customization);
  const loginStage = useSelector<RootState, LoginStage>(state => state.user.loginStage);
  const savedTheme = useRef<Theme>(theme(customization));
  const settings = useSelector((state: RootState) => state.settings);
  const pageIdFound = useSelector((state: RootState) => state.settings.pageIdFound);

  useEffect(() => {
    savedTheme.current = theme(customization);
  }, [customization]);

  const url:string[] = window.location.href.split('/');
  // Поиск и установка id страницы, который соответствует url, в state
  if (!pageIdFound && settings.activeMenuId !== '') {
    for (let item = 0; item < menuItems.items.length; item++) {
      if (pageIdFound) {
        break;
      }
      if (!(menuItems.items[item].id === url[4] || menuItems.items[item].id === url[3])) {
        continue;
      }

      const rightItem = menuItems.items[item];
      for (let childrensNum = 0; childrensNum < (rightItem?.children ? rightItem.children.length : 0); childrensNum++) {
        if (pageIdFound) {
          break;
        }

        const childrens = rightItem.children?.[childrensNum];
        if (childrens?.children) {
          if (childrens.id !== url[url.length - 2]) {
            continue;
          }

          for (let childrenNum = 0; childrenNum < childrens.children.length; childrenNum++) {
            if (pageIdFound) {
              break;
            }
            const children = childrens.children[childrenNum];
            if (children.url !== (url[url.length - 3] + '/' + url[url.length - 2] + '/' + url[url.length - 1])) {
              continue;
            }

            dispatch(setPageIdFound(true));
            dispatch(setActiveMenu(children.id));
          }
        } else {
          if (childrens?.id !== url[url.length - 1]) {
            continue;
          }

          dispatch(setPageIdFound(true));
          dispatch(setActiveMenu(childrens.id));
        }
      }
    }
  }
  return (
    <BrowserRouter>
      <StrictMode>
        <CssBaseline>
          <ThemeProvider theme={savedTheme.current}>
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
                              <Route path="map" element={<Dashboard />} />
                            </Route>
                            <Route path="managment">
                              <Route path="" element={<Navigate to="deals" />} />
                              <Route path="deals" element={<Deals />} />
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
                              <Route path="notifications" element={<NotificationCenter />} />
                              <Route path="faq" element={<FAQ />} />
                              <Route path="permissions">
                                <Route path="" element={<Navigate to="list" />} />
                                <Route path="list" element={<PermissionsList />} />
                                <Route path="usergroups" element={<UserGroups />} />
                              </Route>
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
  );
};

ReactDOM.render(
  <Provider store={store}>
    <Main />
  </Provider>,
  document.getElementById('root')
);
