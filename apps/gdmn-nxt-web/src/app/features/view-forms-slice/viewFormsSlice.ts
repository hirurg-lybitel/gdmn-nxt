import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IViewForm {
  name: string;
  pathname: string;
  loading?: boolean;
};

interface IViewFormState {
  viewForms: IViewForm[];
};

export const viewFormsSlice = createSlice({
  name: 'viewForms',
  initialState: {
    viewForms: []
  } as IViewFormState,
  reducers: {
    addViewForm: (state, action: PayloadAction<IViewForm>) => {
      state.viewForms.push(action.payload);
    },
    removeViewForm: (state, action: PayloadAction<string>) => {
      const idx = state.viewForms.findIndex(vf => vf.pathname === action.payload);
      if (idx >= 0) {
        state.viewForms.splice(idx, 1);
      }
    },
  },
});

export const { addViewForm, removeViewForm } = viewFormsSlice.actions;

export default viewFormsSlice.reducer;