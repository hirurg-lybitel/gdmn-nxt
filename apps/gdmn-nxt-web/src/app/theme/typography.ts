import { ThemeOptions } from '@mui/material';
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
  return {
    fontFamily: theme.fontFamily,
    fontWeightMedium: 600,
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      color: theme.textColor,
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
