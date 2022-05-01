import { createTheme } from '@mui/material';
import { Theme, ThemeOptions } from '@mui/material/styles/createTheme';
import { TypographyStyle, TypographyStyleOptions } from '@mui/material/styles/createTypography';

type GdmnThemeOptions = ThemeOptions & {
  typography: {
    smallUI: TypographyStyleOptions;
    mediumUI: TypographyStyleOptions;
    largeUI: TypographyStyleOptions;
    selectedUI: TypographyStyleOptions;
  }
};

export type GdmnTheme = Theme & {
  typography: {
    smallUI: TypographyStyle;
    mediumUI: TypographyStyle;
    largeUI: TypographyStyle;
    selectedUI: TypographyStyle;
  }
};

export const gdmnTheme = createTheme({
  typography: {
    body1: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
      ].join(','),
      fontSize: 14
    },
    smallUI: {
      fontSize: 12,
    },
    mediumUI: {
      fontSize: 13,
    },
    largeUI: {
      fontSize: 14,
    },
    selectedUI: {
      fontWeight: 600
    },
    fontSize: 12,
    htmlFontSize: 10
  },
} as GdmnThemeOptions) as GdmnTheme;
