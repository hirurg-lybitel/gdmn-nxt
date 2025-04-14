import { ColorMode, ISystemSettings } from '@gsbelarus/util-api-types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ICustomization {
  colorMode: ColorMode,
}

const initCustomization: ICustomization = {
  colorMode: ColorMode.Dark
};

export interface IAppOptions {
  saveFilters: boolean
}

const initAppOptions: IAppOptions = {
  saveFilters: true
};

interface ISettingsState {
  menuOpened: boolean;
  customization: ICustomization,
  system?: ISystemSettings,
  appOptions: IAppOptions
};

const initialState: ISettingsState = {
  menuOpened: false,
  customization: initCustomization,
  appOptions: initAppOptions
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
    setAppOptions: (state, action: PayloadAction<IAppOptions>) => {
      return ({ ...state, appOptions: { ...state.appOptions, ...action.payload } });
    }
  }
});

export const {
  toggleMenu,
  setColorMode,
  setSystemSettings,
  setAppOptions
} = settingsSlice.actions;

export default settingsSlice.reducer;
