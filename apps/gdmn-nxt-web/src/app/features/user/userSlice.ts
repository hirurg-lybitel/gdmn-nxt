import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserState {
  login: string | undefined;
};

const initialState: UserState = {
  login: undefined
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setLogin: (state, action: PayloadAction<string>) => {
      state.login = action.payload
    }
  }
});

// Action creators are generated for each case reducer function
export const { setLogin } = userSlice.actions;

export default userSlice.reducer;