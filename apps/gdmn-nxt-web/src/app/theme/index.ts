import { ColorMode } from '@gsbelarus/util-api-types';
import { colors, ThemeOptions } from '@mui/material';
import * as locales from '@mui/material/locale';
import { createTheme } from '@mui/material/styles';
import { ICustomization } from '../store/settingsSlice';
import componentStyleOverrides from './componentStyleOverrides';
import { StyledTheme } from './styles';
import themeTypography from './typography';
import { themes } from './presets';

declare module '@mui/material/styles' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Theme extends StyledTheme {}
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface ThemeOptions extends StyledTheme {}
  interface BreakpointOverrides {
    xs: true;
    sm: true;
    md: true;
    lg: true;
    xl: true;
    laptop: true;
    ultraWide: true;
  }
};

export const theme = (customization: ICustomization) => {
  const themeOptionDefault = (() => {
    switch (customization.colorMode) {
      case ColorMode.Light:
        return themes.light.grey;
      case ColorMode.Dark:
        return themes.dark.black;
      default:
        return themes.light.grey;
    }
  })();

  const themeOptions: ThemeOptions = {
    color: colors,
    drawerWidth: 260,
    textColor: themeOptionDefault.textColor,
    captionTextColor: themeOptionDefault.captionTextColor,
    fontFamily: themeOptionDefault.fontFamily,
    palette: {
      mode: customization.colorMode,
      primary: {
        main: themeOptionDefault.primaryColor,
        contrastText: 'white'
      },
      secondary: {
        main: themeOptionDefault.secondaryColor
      },
      error: {
        main: themeOptionDefault.errorColor ?? ''
      },
      background: {
        default: themeOptionDefault.backgroundColor,
        paper: themeOptionDefault.paperColor,
      },
      text: {
        primary: themeOptionDefault.textColor
      },
    },
    menu: {
      backgroundColor: themeOptionDefault.menuBackgroundColor,
      color: themeOptionDefault.menuTextColor
    },
    mainContent: {
      backgroundColor: themeOptionDefault.backgroundColor,
      width: '100%',
      minHeight: 'calc(100vh - 10px)',
      flexGrow: 1,
      padding: '20px',
      marginTop: '10px',
      marginRight: '20px',
      borderRadius: '8px',
      borderColor: themeOptionDefault.borderColor,
      buttonTextColor: themeOptionDefault.buttonTextColor,
      buttonPrimaryColor: themeOptionDefault.buttonPrimaryColor,
    },
    breakpoints: {
      /** breakpoints берём немного с меньше, чем разрешение экрана*/
      values: {
        xs: 0,
        sm: 600,
        md: 900,
        lg: 1280,
        xl: 1536,
        laptop: 1366,
        ultraWide: 1920
      }
    }
  };

  const theme = createTheme({ ...themeOptions, typography: { ...themeTypography(themeOptions) } }, locales.ruRU);
  theme.components = { ...locales.ruRU.components, ...componentStyleOverrides(theme) };
  theme.shadows[1] = theme.shadows[1] = customization.colorMode === ColorMode.Dark
    ? '0px 4px 20px rgba(0,0,0,0.5)'
    : '0px 4px 20px rgba(170, 180, 190, 0.3)';

  return theme;
};
