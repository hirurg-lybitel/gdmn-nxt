import { colors } from '@mui/material';
import * as locales from '@mui/material/locale';
import { createTheme, ThemeOptions } from '@mui/material/styles';
import { breakpoints } from '@mui/system';
import { ICustomization } from '../store/settingsSlice';
import componentStyleOverrides from './componentStyleOverrides';
import { styledTheme } from './styles';
import themeTypography from './typography';

declare module '@mui/material/styles' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Theme extends styledTheme {}
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface ThemeOptions extends styledTheme {}
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
  const themeOption = (customization.mode === 'light'
    ? {
      backgroundColor: colors.grey[100],
      backgroundDefault: colors.blue[300],
      backgroundSecond: colors.blue[300],
      textColor: colors.grey[900],
      secondaryColor: colors.common.white,
      headColor: colors.common.white,
      paper: colors.common.white,
      customization,
    }
    : {
      backgroundColor: colors.grey[900],
      backgroundDefault: colors.blueGrey[900],
      backgroundSecond: colors.blueGrey[300],
      textColor: colors.common.white,
      secondaryColor: colors.grey[300],
      headColor: colors.grey[300],
      paper: colors.grey[800],
      customization,
    }
  );

  const themeOptions: ThemeOptions = {
    color: colors,
    drawerWidth: 260,
    headColor: themeOption.headColor,
    textColor: themeOption.textColor,
    palette: {
      mode: themeOption.customization.mode,
      background: {
        paper: themeOption.paper,
        default: colors.common.white
      },
      primary: {
        main: themeOption.backgroundSecond,
        contrastText: themeOption.headColor,
      },
      secondary: {
        main: themeOption.secondaryColor
      },
      text: {
        primary: themeOption.textColor
      }
    },
    menu: {
      backgroundColor: themeOption.backgroundDefault,
      color: themeOption.headColor
    },
    mainContent: {
      backgroundColor: themeOption.backgroundColor,
      width: '100%',
      minHeight: 'calc(100vh - 88px)',
      flexGrow: 1,
      padding: '20px',
      marginTop: '88px',
      marginRight: '20px',
      borderRadius: '12px',
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

  const themes = createTheme(themeOptions, locales.ruRU);
  themes.typography = { ...themes.typography, ...themeTypography(themeOptions) };
  themes.components = { ...locales.ruRU.components, ...componentStyleOverrides(themeOptions) };
  themes.shadows[1] = themeOption.customization.mode === 'dark'
    ? '0px 4px 20px rgba(100, 110, 120, 0.3)'
    : '0px 4px 20px rgba(170, 180, 190, 0.3)';

  return themes;
};
