import { createSlice } from "@reduxjs/toolkit";

export const errorSlice = createSlice({
    name: "error",
    initialState: {
        errorMessage: '',
        errorStatus: 0,
    },
    reducers: {
        setError: (state, action) => {
            state.errorMessage = action.payload.errorMessage;
            state.errorStatus = action.payload.status;
        },
        clearError: (state) => {
          state.errorMessage = '';
          state.errorStatus = 0;
        },
    },
});

export const { setError, clearError } = errorSlice.actions;

export default errorSlice.reducer;
