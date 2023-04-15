import { ColorMode } from '@gsbelarus/util-api-types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ICustomization {
  colorMode: ColorMode,
}

const initCustomization: ICustomization = {
  colorMode: ColorMode.Light
};

interface ISettingsState {
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
    setColorMode: (state, action: PayloadAction<ColorMode>) => {
      return ({ ...state, customization: { ...state.customization, colorMode: action.payload } });
    },
  }
});

export const {
  toggleMenu,
  setColorMode,
} = settingsSlice.actions;

export default settingsSlice.reducer;
