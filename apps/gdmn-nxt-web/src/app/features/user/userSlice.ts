import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type LoginStage =
  'LAUNCHING'        // the application is launching
  | 'QUERY_LOGIN'    // we are in the process of querying server for saved session
  | 'CLIENT'         //
  | 'SIGN_IN'        // show sign-in or sign-up screen
  | 'QUERY_LOGOUT';  //

export interface UserState {
  loginStage: LoginStage;
  userName: string | undefined;
};

const initialState: UserState = {
  loginStage: 'LAUNCHING',
  userName: undefined
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserName: (state, action: PayloadAction<string>) => {
      state.userName = action.payload
    },
    setLoginStage: (state, action: PayloadAction<LoginStage>) => {
      state.loginStage = action.payload;
    }
  }
});

// Action creators are generated for each case reducer function
export const { setUserName, setLoginStage } = userSlice.actions;

export default userSlice.reducer;