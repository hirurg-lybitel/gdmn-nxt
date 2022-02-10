import { colors } from '@mui/material';
import { createTheme, ThemeOptions } from '@mui/material/styles';
import { ICustomization } from '../store/settingsSlice';
import componentStyleOverrides from './componentStyleOverrides';
import { styledTheme } from './styles';
import themeTypography from './typography';

declare module '@mui/material/styles' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Theme extends styledTheme {}
  // allow configuration using `createTheme`
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface ThemeOptions extends styledTheme {}
};

export const theme = (customization: ICustomization) => {
  const themeOption = {
    backgroundColor: colors.grey[100],
    backgroundDefault: colors.blue[300],
    textColor: colors.grey[900],
    secondaryColor: colors.grey[50],
    headColor: colors.grey[50],
    paper: colors.grey[50],
    customization
  }

  const themeOptions: ThemeOptions = {
    color: colors,
    drawerWidth: 260,
    headColor: themeOption.headColor ,
    textColor: themeOption.textColor,
    palette: {
      mode: themeOption.customization.mode,
      background: {
        paper: themeOption.paper,
        default: themeOption.backgroundDefault
      },
      primary: {
        main: themeOption.backgroundDefault,
        contrastText: themeOption.headColor
      },
      secondary: {
        main: themeOption.secondaryColor
      },
      text: {
        primary: themeOption.textColor
      }
    },
    menu:{
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
      borderRadius: '12px'
    },
  }

  const themes = createTheme(themeOptions);
  themes.typography = { ...themes.typography, ...themeTypography(themeOptions) };
  themes.components = componentStyleOverrides(themeOptions);

  return themes;
};
