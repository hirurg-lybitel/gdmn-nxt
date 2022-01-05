import { IUserProfile } from '@gsbelarus/util-api-types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type LoginStage =
  'LAUNCHING'            // the application is launching
  | 'QUERY_LOGIN'        // we are in the process of querying server for saved session
  | 'SELECT_MODE'        // choose between belgiss employee and customer mode
  | 'CUSTOMER'             //
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
    setUserName: (state, action: PayloadAction<{ userName: string, gedeminUser: boolean }>) => {
      if (state.userProfile) {
        state.userProfile = { ...state.userProfile, userName: action.payload.userName };
      } else {
        state.userProfile = { userName: action.payload.userName };
      }
      state.gedeminUser = action.payload.gedeminUser;
    },
    setSelectMode: () => ({ loginStage: 'SELECT_MODE' } as UserState),
    setLoginStage: (state, action: PayloadAction<LoginStage>) => {
      state.loginStage = action.payload;
    }
  }
});

// Action creators are generated for each case reducer function
export const { setUserName, setLoginStage, setSelectMode } = userSlice.actions;

export default userSlice.reducer;