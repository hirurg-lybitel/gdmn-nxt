import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IError {
  errorMessage: string;
  errorStatus: number;
};

const initialState: IError = {
  errorMessage: '',
  errorStatus: 0,
};

export const errorSlice = createSlice({
    name: "error",
    initialState,
    reducers: {
      setError: (_, action: PayloadAction<IError>) => action.payload,
      clearError: () => initialState,
    },
});

export const { setError, clearError } = errorSlice.actions;

export default errorSlice.reducer;
