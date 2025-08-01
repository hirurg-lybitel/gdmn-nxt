import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { Button, CssBaseline, GlobalStyles } from '@mui/material';
import { StrictMode, useEffect, useState } from 'react';
import * as ReactDOM from 'react-dom/client';
import { RootState, store } from './app/store';
import { Provider, useSelector } from 'react-redux';
import { BrowserRouter, HashRouter, Navigate, Route, Routes } from 'react-router-dom';
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
import StandardOrder from './app/standard-order/standard-order';
import ReconciliationStatement from './app/reconciliation-statement/reconciliation-statement';
import Deals from './app/pages/Managment/deals/deals';
import SalesFunnel from './app/pages/Analytics/sales-funnel/sales-funnel';
import { ErModelDomains } from './app/er-model-domains/er-model-domains';
import BaseForm from './app/base-form/base-form';
import { NlpMain } from './app/nlp-main/nlp-main';
import { SqlEditor } from './app/components/System/sql-editor/sql-editor';
import CustomersMap from './app/customers/customers-map/customers-map';
import RemainsByInvoices from './app/pages/Analytics/UserReports/remains-by-invoices/remains-by-invoices';
import Labels from './app/pages/Managment/Labels';
import { LocalizationProvider } from '@mui/x-date-pickers-pro';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ruLocale from 'date-fns/locale/ru';
import PermissionsList from './app/pages/Permissions/permissions-list/permissions-list';
import UserGroups from './app/pages/Permissions/user-groups/user-groups';
import TopEarningPage from './app/pages/Analytics/UserReports/TopEarningPage';
import Profile, { TABS } from './app/pages/Preferences/profile/profile';
import NotificationCenter from './app/pages/NotificationCenter/notification-center/notification-center';
import FAQ from './app/pages/FAQ/Index';
import UpdatesHistory from './app/pages/UpdatesHistory';
import { SnackbarProvider } from 'notistack';
import NotFound from './app/pages/NotFound';
import Analytics from './app/pages/Dashboard/analytics/analytics';
import DealSources from './app/pages/Managment/dealsCatalogs/deal-sources/deal-sources';
import DenyReasons from './app/pages/Managment/dealsCatalogs/deny-reasons/deny-reasons';
import { ColorMode } from '@gsbelarus/util-api-types';
import { Tasks } from './app/pages/Managment/tasks/tasks';
import TaskTypes from './app/pages/Managment/tasksCatalogs/task-types/task-types';
import Contacts from './app/pages/Managment/Contacts';
import { Contracts } from './app/pages/Managment/contracts';
import OurContacts from './app/pages/Managment/ourContacts';
import Mailing from './app/pages/Marketing/mailing';
import CustomersSegments from './app/pages/Marketing/segments';
import Templates from './app/pages/Marketing/templates';
import { TimeTracker } from './app/pages/Managment/timeTracker';
import { Projects } from './app/pages/Managment/projects';
import ExpectedReceipts from './app/pages/Analytics/UserReports/expected-receipts/expected-receipts';
import ExpectedReceiptsDev from './app/pages/Analytics/UserReports/expected-receipts-dev/expected-receipts-dev';
import Expenses from './app/pages/Analytics/UserReports/expenses/expenses';
import Debts from './app/pages/Analytics/UserReports/debts/debts';
import Revenue from './app/pages/Analytics/UserReports/revenue/revenue';
import TicketsList from './app/pages/Tickets/ticketsList/ticketsList';
import TicketChat from './app/pages/Tickets/ticketChat/ticketChat';
import TicketsCustomers from './app/pages/Tickets/tickets-customers/tickets-customers';
import TicketsUsers from './app/pages/Tickets/tickets-users/tickets-users';

registerMUI();

const Main = () => {
  const customization = useSelector(
    (state: RootState) => state.settings.customization
  );

  const loginStage = useSelector<RootState, LoginStage>(
    (state) => state.user.loginStage
  );

  const [savedTheme, setSavedTheme] = useState<Theme>(theme(customization));
  const settings = useSelector((state: RootState) => state.settings);

  useEffect(() => {
    setSavedTheme(theme(customization));
  }, [customization]);

  const CustomRouter = process.env.NODE_ENV === 'development' ? BrowserRouter : HashRouter;

  return (
    <div
      style={{
        background: settings.customization.colorMode === ColorMode.Dark ? '#424242' : 'white',
        height: '100%'
      }}
      translate="no"
    >
      <CustomRouter>
        <StrictMode>
          <ThemeProvider theme={savedTheme}>
            <CssBaseline />
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              localeText={{
                start: 'Начало периода',
                end: 'Конец периода',
                dateTimePickerToolbarTitle: 'Укажите дату и время',
                openNextView: 'следующее окно',
                openPreviousView: 'предыдущее окно',
                cancelButtonLabel: 'Отмена',
                todayButtonLabel: 'Сегодня',
                fieldDayPlaceholder: ({ format }) => 'д'.repeat(format.length),
                fieldMonthPlaceholder: ({ format }) => 'м'.repeat(format.length),
                fieldYearPlaceholder: ({ format }) => 'гггг',
                fieldHoursPlaceholder: ({ format }) => 'ч'.repeat(format.length),
                fieldMinutesPlaceholder: ({ format }) => 'м'.repeat(format.length),
                fieldSecondsPlaceholder: ({ format }) => 'с'.repeat(format.length)
              }}
              adapterLocale={ruLocale}
            >
              <SnackbarProvider maxSnack={3}>
                {
                  <>
                    {(() => {
                      if (loginStage === 'TICKETS') {
                        return (
                          <Routes>
                            <Route path="" element={<Navigate to="tickets" />} />
                            <Route path="tickets" element={<MainLayout />}>
                              <Route path="" element={<Navigate to="list" />} />
                              <Route path="list" element={<TicketsList />} />
                              <Route path="list/:id" element={<TicketChat />} />
                              <Route path="users" element={<TicketsUsers />} />
                              <Route path="settings">
                                <Route path="" element={<Navigate to="account" />} />
                                {TABS.map((tab) => (
                                  <Route
                                    key={tab}
                                    path={tab}
                                    element={<Profile baseUrl={'/tickets'} />}
                                  />
                                ))}
                              </Route>
                            </Route>
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        );
                      }
                      if (loginStage === 'EMPLOYEE') {
                        return (
                          <Routes>
                            <Route path="/employee" element={<MainLayout />}>
                              <Route path="" element={<Navigate to="dashboard/overview" />} />
                              <Route path="dashboard">
                                <Route path="" element={<Navigate to="overview" />} />
                                <Route path="overview" element={<Dashboard />} />
                                <Route path="analytics" element={<Analytics />} />
                              </Route>
                              <Route path="managment">
                                <Route path="" element={<Navigate to="contacts" />} />
                                <Route path="time-tracker" element={<TimeTracker />} />
                                <Route path="contacts" element={<Contacts />} />
                                <Route path="ourContacts" element={<OurContacts />} />
                                <Route path="deals">
                                  <Route path="" element={<Navigate to="list" />} />
                                  <Route path="list" element={<Deals />} />
                                  <Route path="dealSources" element={<DealSources />} />
                                  <Route path="denyReasons" element={<DenyReasons />} />
                                </Route>
                                <Route path="tasks">
                                  <Route path="list" element={<Tasks />} />
                                  <Route path="taskTypes" element={<TaskTypes />} />
                                </Route>
                                <Route path="customers">
                                  <Route path="" element={<Navigate to="list" />} />
                                  <Route path="orders/list" element={<OrderList />} />
                                  <Route path="list" element={<CustomersList />} />
                                  {/* <Route path="list/details/:id" element={<CustomerDetails />} /> */}
                                </Route>
                                <Route path="contracts" element={<Contracts />} />
                                <Route path="labels" element={<Labels />} />
                                <Route path="projects" element={<Projects />} />
                              </Route>
                              <Route path="marketing">
                                <Route path="" element={<Navigate to="mailing" />} />
                                <Route path="mailing" element={<Mailing />} />
                                <Route path="segments" element={<CustomersSegments />} />
                                <Route path="templates" element={<Templates />} />
                              </Route>
                              <Route path="analytics">
                                <Route path="" element={<Navigate to="reports/reconciliation" />} />
                                <Route path="reports">
                                  <Route path="" element={<Navigate to="reconciliation" />} />
                                  <Route path="reconciliation" element={<ReconciliationAct />} />
                                  <Route path="reconciliation/:customerId" element={<ReconciliationAct />} />
                                  <Route path="remainbyinvoices" element={<RemainsByInvoices />} />
                                  <Route path="topEarning" element={<TopEarningPage />} />
                                  <Route path="expectedreceipts" element={<ExpectedReceipts />} />
                                  <Route path="expectedreceiptsdev" element={<ExpectedReceiptsDev />} />
                                  <Route path="expenses" element={<Expenses />} />
                                  <Route path="debts" element={<Debts />} />
                                  <Route path="revenue" element={<Revenue />} />
                                </Route>
                                <Route path="salesfunnel" element={<SalesFunnel />} />
                              </Route>
                              <Route path="tickets">
                                <Route path="" element={<Navigate to="list" />} />
                                <Route path="list" element={<TicketsList />} />
                                <Route path="list/:id" element={<TicketChat />} />
                                <Route path="customers" element={<TicketsCustomers />} />
                              </Route>
                              <Route path="system">
                                <Route path="settings">
                                  <Route path="" element={<Navigate to="account" />} />
                                  {TABS.map((tab) => (
                                    <Route
                                      key={tab}
                                      path={tab}
                                      element={<Profile />}
                                    />
                                  ))}
                                </Route>
                                <Route path="permissions">
                                  <Route path="" element={<Navigate to="list" />} />
                                  <Route path="list" element={<PermissionsList />} />
                                  <Route path="usergroups" element={<UserGroups />} />
                                </Route>
                                <Route path="notifications" element={<NotificationCenter />} />
                                <Route path="faq" element={<FAQ />} />
                                <Route path="updates-history" element={<UpdatesHistory />} />
                              </Route>
                            </Route>
                            <Route path="/platform" element={<BaseForm />}>
                              <Route path="" element={<Navigate to="er-model-domains" />} />
                              <Route path="er-model-domains" element={<ErModelDomains />} />
                              <Route path="er-model" element={<ErModel />} />
                              <Route path="nlp-main" element={<NlpMain />} />
                              <Route path="sql-editor" element={<SqlEditor />} />
                              <Route path="*" element={<NotFound />} />
                            </Route>
                            <Route path="/" element={<Navigate to="/employee/dashboard" />} />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        );
                      }
                      if (loginStage === 'CUSTOMER') {
                        return (
                          <Routes>
                            <Route path="/customer" element={<CustomerHomePage />} >
                              <Route path="" element={<Navigate to="standard-order" />} />
                              <Route path="standard-order" element={<StandardOrder />} />
                              <Route path="reconciliation-statement" element={<ReconciliationStatement custId={148333193} />} />
                            </Route>
                            <Route path="/" element={<Navigate to="/customer" />} />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        );
                      }
                      return <App />;
                    })()}
                  </>
                }
              </SnackbarProvider>
            </LocalizationProvider>
          </ThemeProvider>
        </StrictMode>
      </CustomRouter>
    </div>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <Provider store={store}>
    <Main />
  </Provider>
);
