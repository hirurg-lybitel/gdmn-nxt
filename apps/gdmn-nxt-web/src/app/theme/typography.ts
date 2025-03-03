import { ThemeOptions } from '@mui/material';
import { Typography } from '@mui/material/styles/createTypography';
import { CSSProperties } from '@mui/styles';

declare module '@mui/material/styles' {
  interface TypographyVariants {
    pageHeader: React.CSSProperties;
  }
  interface TypographyVariantsOptions {
    pageHeader?: React.CSSProperties;
  }
}
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    pageHeader: true;
  }
}

export default function typography(theme: ThemeOptions): Partial<Typography> {
  return {
    fontFamily: theme.fontFamily,
    fontWeightMedium: 600,
    body1: {
      lineHeight: 1.3,
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      color: theme.captionTextColor,
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
      fontSize: '1.3rem',
      fontWeight: 600,
      color: theme.textColor,
      letterSpacing: '1.5px',
    },
    h6: {
      letterSpacing: '1px'
    }
  };
};
