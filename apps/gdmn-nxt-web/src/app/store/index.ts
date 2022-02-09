import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/dist/query';
import { accountApi } from '../features/account/accountApi';
import { contactApi } from '../features/contact/contactApi';
import { reconciliationStatementApi } from '../features/reconciliation-statement/reconciliationStatementApi';
import userReducer from '../features/user/userSlice';
import { customersReducer, hierarchyReducer } from '../features/customer/customerSlice';
import { labelsApi } from '../features/labels/labelsApi';
import { contactGroupApi } from '../features/contact/contactGroupApi';
import { errorMiddleware } from '../features/error-slice/errorMiddleware';
import errorReducer from '../features/error-slice/error-slice';
import settingsReducer from './settingsSlice';
import { erModelApi } from '../features/er-model/erModelApi';

export const store = configureStore({
  reducer: {
    settings: settingsReducer,
    error: errorReducer,
    user: userReducer,
    customers: customersReducer,
    customersHierarchy: hierarchyReducer,
    [contactApi.reducerPath]: contactApi.reducer,
    [accountApi.reducerPath]: accountApi.reducer,
    [labelsApi.reducerPath]: labelsApi.reducer,
    [contactGroupApi.reducerPath]: contactGroupApi.reducer,
    [reconciliationStatementApi.reducerPath]: reconciliationStatementApi.reducer,
    [erModelApi.reducerPath]: erModelApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false})
    .concat(contactApi.middleware)
    .concat(accountApi.middleware)
    .concat(labelsApi.middleware)
    .concat(contactGroupApi.middleware)
    .concat(reconciliationStatementApi.middleware)
    .concat(erModelApi.middleware)
    .concat(errorMiddleware),
});

setupListeners(store.dispatch);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
