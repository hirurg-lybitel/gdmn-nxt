import { ThemeOptions } from "@mui/material";

export default function typography(theme: ThemeOptions) {
  return {
    h1: {
      fontSize: '1.5rem',
      fontWeight: 700,
      color: theme.textColor,
    },
    h2: {
      fontSize: '0.8rem',
      color: theme.headColor,
      fontWeight: 800
    },
    h3: {
      fontSize: '1.25rem',
      color: theme.textColor,
      fontWeight: 600
    },
    h4: {
      fontSize: '1rem',
      color: theme.headColor,
      fontWeight: 600
    },
    h5: {
      fontSize: '0.9rem',
      color: theme.headColor,
      fontWeight: 600,
    },
    h6: {
      fontSize: '2.75rem',
      fontWeight: 500,
      color: theme.headColor,
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      color: theme.textColor,
      fontFamily: '"Roboto","Helvetica","Arial",sans-serif'
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 400,
      color: theme.textColor,
    },
    subtitle2: {
      fontSize: '12rem',
      fontWeight: 400,
      color: theme.textColor,
    },

  };
};
