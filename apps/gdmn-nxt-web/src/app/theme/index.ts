import { ColorMode } from '@gsbelarus/util-api-types';
import { colors, ThemeOptions } from '@mui/material';
import * as locales from '@mui/material/locale';
import { createTheme } from '@mui/material/styles';
import { ICustomization } from '../store/settingsSlice';
import componentStyleOverrides from './componentStyleOverrides';
import { StyledTheme } from './styles';
import themeTypography from './typography';

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
  const themeOptionDefault = {
    // fontFamily: '"Roboto Condensed", sans-serif',
    // fontFamily: '"Lato", sans-serif',
    // fontFamily: '"PT Sans", sans-serif',
    fontFamily: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Helvetica', 'Arial', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"'].join(','),
    ...(customization.colorMode === ColorMode.Light
      ? {
        backgroundColor: colors.grey[100],
        backgroundDefault: colors.blue[300],
        backgroundSecond: colors.blue[300],
        textColor: colors.grey[800],
        captionTextColor: colors.grey[600],
        secondaryColor: colors.common.white,
        headColor: colors.common.white,
        paper: colors.common.white,
        customization,
        borderColor: '#f0f0f0',
        buttonTextColor: 'white'
      }
      : {
        backgroundColor: colors.grey[900],
        backgroundDefault: colors.blueGrey[900],
        backgroundSecond: colors.blue[400],
        textColor: colors.common.white,
        captionTextColor: colors.grey[500],
        secondaryColor: colors.grey[300],
        headColor: colors.grey[300],
        paper: colors.grey[800],
        customization,
        borderColor: '#303030',
        buttonTextColor: 'white'
      }
    )
  };

  const themeOptions: ThemeOptions = {
    color: colors,
    drawerWidth: 260,
    headColor: themeOptionDefault.headColor,
    textColor: themeOptionDefault.textColor,
    captionTextColor: themeOptionDefault.captionTextColor,
    fontFamily: themeOptionDefault.fontFamily,
    palette: {
      mode: themeOptionDefault.customization.colorMode,
      background: {
        paper: themeOptionDefault.paper,
        default: colors.common.white,
      },
      primary: {
        main: themeOptionDefault.backgroundSecond,
        contrastText: themeOptionDefault.headColor,
      },
      secondary: {
        main: themeOptionDefault.secondaryColor
      },
      text: {
        primary: themeOptionDefault.textColor
      },
    },
    menu: {
      backgroundColor: themeOptionDefault.backgroundDefault,
      color: themeOptionDefault.headColor
    },
    mainContent: {
      backgroundColor: themeOptionDefault.backgroundColor,
      width: '100%',
      minHeight: 'calc(100vh - 10px)',
      flexGrow: 1,
      padding: '20px',
      marginTop: '10px',
      marginRight: '20px',
      borderRadius: '12px',
      borderColor: themeOptionDefault.borderColor,
      buttonTextColor: themeOptionDefault.buttonTextColor
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
  theme.shadows[1] = themeOptionDefault.customization.colorMode === ColorMode.Dark
    ? '0px 4px 20px rgba(100, 110, 120, 0.3)'
    : '0px 4px 20px rgba(170, 180, 190, 0.3)';

  return theme;
};
