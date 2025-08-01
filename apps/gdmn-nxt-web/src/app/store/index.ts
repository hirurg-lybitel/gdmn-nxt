import { faqApi } from './../features/FAQ/faqApi';
import { Action, combineReducers, configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/dist/query';
import { accountApi } from '../features/account/accountApi';
import { contactApi } from '../features/contact/contactApi';
import userReducer from '../features/user/userSlice';
import nlpReducer from '../features/nlp/nlpSlice';
import { contactGroupApi } from '../features/contact/contactGroupApi';
import { errorMiddleware } from '../features/error-slice/errorMiddleware';
import errorReducer from '../features/error-slice/error-slice';
import settingsReducer from './settingsSlice';
import viewFormsReducer from '../features/view-forms-slice/viewFormsSlice';
import { erModelApi } from '../features/er-model/erModelApi';
import { departmentsApi } from '../features/departments/departmentsApi';
import { customerContractsApi } from '../features/customer-contracts/customerContractsApi';
import { kanbanApi } from '../features/kanban/kanbanApi';
import { actCompletionApi } from '../features/act-completion/actCompletionApi';
import { bankStatementApi } from '../features/bank-statement/bankStatementApi';
import { chartDataApi } from '../features/charts/chartDataApi';
import { nlpQueryApi } from '../features/nlp/nlpApi';
import { sqlEditorApi } from '../features/sql-editor/sqlEditorApi';
import { customerApi } from '../features/customer/customerApi_new';
import filtersReducer from './filtersSlice';
import { contractsListApi } from '../features/contracts-list/contractsListApi';
import { workTypesApi } from '../features/work-types/workTypesApi';
import { labelsApi } from '../features/labels';
import { permissionsApi } from '../features/permissions';
import { systemUsers } from '../features/systemUsers';
import { businessProcessesApi } from '../features/business-processes';
import { profileSettingsApi } from '../features/profileSettings';
import { kanbanCatalogsApi } from '../features/kanban/kanbanCatalogsApi';
import { kanbanFiltersApi } from '../features/kanban/kanbanFiltersApi';
import { authApi } from '../features/auth/authApi';
import { updatesApi } from '../features/updates';
import { systemSettingsApi } from '../features/systemSettings';
import { templateApi } from '../features/Marketing/templates/templateApi';
import { segmentApi } from '../features/Marketing/segments/segmentsApi';
import { filtersApi } from '../features/filters/filtersApi';
import { mailingApi } from '../features/Marketing/mailing';
import { customerFeedbackApi } from '../features/customer-feedback';
import { timeTrackingApi } from '../features/time-tracking';
import { securityApi } from '../features/security/securityApi';
import { dealFeedbackApi } from '../features/deal-feedback';
import { reportsApi } from '../features/reports/reportsApi';
import { ticketsApi } from '../features/tickets/ticketsApi';

const reducers = combineReducers({
  viewForms: viewFormsReducer,
  settings: settingsReducer,
  filtersStorage: filtersReducer,
  error: errorReducer,
  user: userReducer,
  nlp: nlpReducer,
  [contactApi.reducerPath]: contactApi.reducer,
  [accountApi.reducerPath]: accountApi.reducer,
  [labelsApi.reducerPath]: labelsApi.reducer,
  [contactGroupApi.reducerPath]: contactGroupApi.reducer,
  [erModelApi.reducerPath]: erModelApi.reducer,
  [departmentsApi.reducerPath]: departmentsApi.reducer,
  [customerContractsApi.reducerPath]: customerContractsApi.reducer,
  [kanbanApi.reducerPath]: kanbanApi.reducer,
  [actCompletionApi.reducerPath]: actCompletionApi.reducer,
  [bankStatementApi.reducerPath]: bankStatementApi.reducer,
  [chartDataApi.reducerPath]: chartDataApi.reducer,
  [nlpQueryApi.reducerPath]: nlpQueryApi.reducer,
  [sqlEditorApi.reducerPath]: sqlEditorApi.reducer,
  [customerApi.reducerPath]: customerApi.reducer,
  [contractsListApi.reducerPath]: contractsListApi.reducer,
  [workTypesApi.reducerPath]: workTypesApi.reducer,
  [permissionsApi.reducerPath]: permissionsApi.reducer,
  [systemUsers.reducerPath]: systemUsers.reducer,
  [businessProcessesApi.reducerPath]: businessProcessesApi.reducer,
  [profileSettingsApi.reducerPath]: profileSettingsApi.reducer,
  [faqApi.reducerPath]: faqApi.reducer,
  [updatesApi.reducerPath]: updatesApi.reducer,
  [kanbanCatalogsApi.reducerPath]: kanbanCatalogsApi.reducer,
  [kanbanFiltersApi.reducerPath]: kanbanFiltersApi.reducer,
  [authApi.reducerPath]: authApi.reducer,
  [systemSettingsApi.reducerPath]: systemSettingsApi.reducer,
  [templateApi.reducerPath]: templateApi.reducer,
  [segmentApi.reducerPath]: segmentApi.reducer,
  [filtersApi.reducerPath]: filtersApi.reducer,
  [mailingApi.reducerPath]: mailingApi.reducer,
  [customerFeedbackApi.reducerPath]: customerFeedbackApi.reducer,
  [timeTrackingApi.reducerPath]: timeTrackingApi.reducer,
  [securityApi.reducerPath]: securityApi.reducer,
  [dealFeedbackApi.reducerPath]: dealFeedbackApi.reducer,
  [reportsApi.reducerPath]: reportsApi.reducer,
  [ticketsApi.reducerPath]: ticketsApi.reducer
});

const rootReducer = (state: ReturnType<typeof reducers> | undefined, action: Action) => {
  /** Очищаем весь стор при разлогине */
  if (action.type === 'user/logout/fulfilled') {
    // Отменяем все запросы на сохранение фильтров
    if (state) {
      const debouncesMas = Object.values(state.filtersStorage.filterDebounce);
      for (const element of debouncesMas) {
        clearTimeout(element);
      }
    }
    state = undefined;
  }
  return reducers(state, action);
};

export const store = configureStore({
  devTools: process.env.NODE_ENV === 'development',
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false })
    .concat(errorMiddleware)
    .concat(contactApi.middleware)
    .concat(accountApi.middleware)
    .concat(labelsApi.middleware)
    .concat(contactGroupApi.middleware)
    .concat(erModelApi.middleware)
    .concat(departmentsApi.middleware)
    .concat(customerContractsApi.middleware)
    .concat(kanbanApi.middleware)
    .concat(actCompletionApi.middleware)
    .concat(bankStatementApi.middleware)
    .concat(chartDataApi.middleware)
    .concat(nlpQueryApi.middleware)
    .concat(sqlEditorApi.middleware)
    .concat(customerApi.middleware)
    .concat(contractsListApi.middleware)
    .concat(workTypesApi.middleware)
    .concat(labelsApi.middleware)
    .concat(permissionsApi.middleware)
    .concat(systemUsers.middleware)
    .concat(businessProcessesApi.middleware)
    .concat(profileSettingsApi.middleware)
    .concat(faqApi.middleware)
    .concat(updatesApi.middleware)
    .concat(kanbanCatalogsApi.middleware)
    .concat(kanbanFiltersApi.middleware)
    .concat(authApi.middleware)
    .concat(systemSettingsApi.middleware)
    .concat(templateApi.middleware)
    .concat(segmentApi.middleware)
    .concat(filtersApi.middleware)
    .concat(mailingApi.middleware)
    .concat(customerFeedbackApi.middleware)
    .concat(timeTrackingApi.middleware)
    .concat(securityApi.middleware)
    .concat(dealFeedbackApi.middleware)
    .concat(reportsApi.middleware)
    .concat(ticketsApi.middleware)
});

setupListeners(store.dispatch);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
