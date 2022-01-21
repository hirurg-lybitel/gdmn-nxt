import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/dist/query';
import { accountApi } from './features/account/accountApi';
import { contactApi } from './features/contact/contactApi';
import { reconciliationStatementApi } from './features/reconciliation-statement/reconciliationStatementApi';
import userReducer from './features/user/userSlice';
import { customersReducer, hierarchyReducer } from './features/customer/customerSlice';
import { labelsApi } from './features/labels/labelsApi';

export const store = configureStore({
  reducer: {
    user: userReducer,
    customers: customersReducer,
    customersHierarchy: hierarchyReducer,
    [contactApi.reducerPath]: contactApi.reducer,
    [accountApi.reducerPath]: accountApi.reducer,
    [labelsApi.reducerPath]: labelsApi.reducer,
    [reconciliationStatementApi.reducerPath]: reconciliationStatementApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware()
    .concat(contactApi.middleware)
    .concat(accountApi.middleware)
    .concat(labelsApi.middleware)
    .concat(reconciliationStatementApi.middleware),
});

setupListeners(store.dispatch);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
