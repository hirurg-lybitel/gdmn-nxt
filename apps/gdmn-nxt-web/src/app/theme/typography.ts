import { ThemeOptions, TypographyVariants, createTheme } from '@mui/material';
import { Typography } from '@mui/material/styles/createTypography';
import { CSSProperties } from '@mui/styles';

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    pageHeader: true;
  }
}
interface CustomTypography extends Typography {
  pageHeader?: CSSProperties;
}

export default function typography(theme: ThemeOptions): Partial<CustomTypography> {
  // const defaultTheme = createTheme(theme);
  return {
    fontFamily: theme.fontFamily,
    fontWeightMedium: 600,
    // h1: {
    //   // fontSize: '1.2rem',
    //   // fontWeight: 700,
    //   color: theme.textColor,
    // },
    // h2: {
    //   // fontSize: '0.8rem',
    //   color: theme.textColor,
    //   // fontWeight: 800
    // },
    // h3: {
    //   // fontSize: '1.125rem',
    //   color: theme.textColor,
    //   // fontWeight: 600
    // },
    // h4: {
    //   // fontSize: '1rem',
    //   color: theme.textColor,
    //   // fontWeight: 600
    // },
    // h5: {
    //   // fontSize: '0.9rem',
    //   color: theme.textColor,
    //   // fontWeight: 600,
    // },
    // h6: {
    //   // fontSize: '2.75rem',
    //   // fontWeight: 500,
    //   color: theme.textColor,
    // },
    // body1: {
    //   lineHeight: 1.75
    // },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      color: theme.textColor,
      // fontFamily: '"Roboto","Helvetica","Arial",sans-serif'
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 600,
      color: theme.textColor,
      lineHeight: 1.5
    },
    subtitle2: {
      fontSize: '0.8rem',
      fontWeight: 600,
      color: theme.textColor,
    },
    pageHeader: {
      fontSize: '1.5rem',
      fontWeight: 600,
    }
  };
};
