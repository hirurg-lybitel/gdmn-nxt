import { ColorMode } from '@gsbelarus/util-api-types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ICustomization {
  mode: ColorMode,
}

const initCustomization: ICustomization = {
  mode: ColorMode.Light
}

interface ISettingsState {
  menuOpened: boolean;
  activeMenuId: string,
  pageIdFound: boolean,
  customization: ICustomization
};

const initialState: ISettingsState = {
  menuOpened: true,
  activeMenuId: '',
  pageIdFound: false,
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
    setStyleMode: (state, action: PayloadAction<ColorMode>) => {
      return ({ ...state, customization: { ...state.customization, mode: action.payload } });
    },
    setActiveMenu: (state, action: PayloadAction<string>) => {
      return (
        { ...state, activeMenuId: action.payload }
      );
    },
    setPageIdFound: (state, action: PayloadAction<boolean>) => {
      return (
        { ...state, pageIdFound: action.payload }
      );
    }
  }
});

export const {
  toggleMenu,
  setStyleMode,
  setActiveMenu,
  setPageIdFound
} = settingsSlice.actions;

export default settingsSlice.reducer;
