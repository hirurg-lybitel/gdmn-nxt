import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserState {
  userName: string | undefined;
};

const initialState: UserState = {
  userName: undefined
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserName: (state, action: PayloadAction<string>) => {
      state.userName = action.payload
    }
  }
});

// Action creators are generated for each case reducer function
export const { setUserName } = userSlice.actions;

export default userSlice.reducer;