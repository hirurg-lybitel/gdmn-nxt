import { NLPDialog } from "@gsbelarus/util-api-types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface NLPState {
  nlpDialog: NLPDialog;
};

const initialState: NLPState = {
  nlpDialog: []
};

export const nlpSlice = createSlice({
  name: 'nlp',
  initialState,
  reducers: {
    setNLPDialog: (_, action: PayloadAction<NLPDialog>) => ({ nlpDialog: action.payload })
  }
});

// Action creators are generated for each case reducer function
export const { setNLPDialog } = nlpSlice.actions;

export default nlpSlice.reducer;
