import { ColorMode, ISystemSettings } from '@gsbelarus/util-api-types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ICustomization {
  colorMode: ColorMode,
}

const initCustomization: ICustomization = {
  colorMode: ColorMode.Dark
};

interface ISettingsState {
  menuOpened: boolean;
  customization: ICustomization,
  system?: ISystemSettings
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
    setSystemSettings: (state, action: PayloadAction<ISystemSettings>) => {
      return ({ ...state, system: action.payload });
    },
  }
});

export const {
  toggleMenu,
  setColorMode,
  setSystemSettings
} = settingsSlice.actions;

export default settingsSlice.reducer;
