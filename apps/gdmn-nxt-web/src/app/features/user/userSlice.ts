import { IUserProfile } from '@gsbelarus/util-api-types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type LoginStage =
  'LAUNCHING'            // the application is launching
  | 'QUERY_LOGIN'        // we are in the process of querying server for saved session
  | 'SELECT_MODE'        // choose between belgiss employee and customer mode
  | 'CUSTOMER'           //
  | 'EMPLOYEE'           //
  | 'SIGN_IN_EMPLOYEE'   // show sign-in or sign-up screen for an employee
  | 'SIGN_IN_CUSTOMER'   // show sign-in or sign-up screen for a customer
  | 'QUERY_LOGOUT';      //

export interface UserState {
  loginStage: LoginStage;
  userProfile?: IUserProfile;
  gedeminUser?: boolean;
};

const initialState: UserState = {
  loginStage: 'LAUNCHING',
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    queryLogin: () => ({ loginStage: 'QUERY_LOGIN' } as UserState),
    selectMode: () => ({ loginStage: 'SELECT_MODE' } as UserState),
    signInEmployee: () => ({ loginStage: 'SIGN_IN_EMPLOYEE' } as UserState),
    signInCustomer: () => ({ loginStage: 'SIGN_IN_CUSTOMER' } as UserState),
    signedInEmployee: (_, action: PayloadAction<IUserProfile>) => ({ loginStage: 'EMPLOYEE', userProfile: action.payload, gedeminUser: true } as UserState),
    signedInCustomer: (_, action: PayloadAction<IUserProfile>) => ({ loginStage: 'CUSTOMER', userProfile: action.payload } as UserState),
    queryLogout: () => ({ loginStage: 'QUERY_LOGOUT' } as UserState),
  }
});

// Action creators are generated for each case reducer function
export const { queryLogin, selectMode, signInEmployee, signInCustomer, signedInEmployee, signedInCustomer, queryLogout } = userSlice.actions;

export default userSlice.reducer;