import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ICustomization {
  mode: 'light' | 'dark'
}

const initCustomization: ICustomization = {
  mode: 'light'
};

export interface ISettingsState {
  menuOpened: boolean;
  customization: ICustomization
};

const initialState: ISettingsState = {
  menuOpened: true,
  customization: initCustomization
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    toggleMenu: (state, action: PayloadAction<boolean>) => {
      return (
        { ...state, menuOpened: action.payload }
      );
    },
    setStyleMode: (state, action: PayloadAction<'light' | 'dark'>) => {
      return ({ ...state, customization: { ...state.customization, mode: action.payload } });
    }
  }
});

export const {
  toggleMenu,
  setStyleMode
} = settingsSlice.actions;

export default settingsSlice.reducer;
