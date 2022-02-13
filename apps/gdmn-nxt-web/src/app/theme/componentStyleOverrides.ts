import { Components, ThemeOptions } from "@mui/material";

export default function componentStyleOverrides(theme: ThemeOptions): Components {
  return {
    MuiToolbar: {
      styleOverrides: {
        root: {
          height: '70px',
          padding: '15px'
        }
      }
    },
    MuiAvatar: {
      styleOverrides: {
          root: {
              color: theme.palette?.background?.default,
              background: theme.color.grey[200]
          }
      }
    },
    MuiPaper: {
      defaultProps: {
          elevation: 0
      },
      styleOverrides: {
          root: {
              backgroundImage: 'none'
          },
          rounded: {
              borderRadius: '12px'
          },
      }
    },
    MuiButton: {
      styleOverrides: {
          root: {
              //fontWeight: 500,
              //borderRadius: '4px'
          }
      }
    },
    MuiCardHeader: {
      styleOverrides: {
          root: {
              color: theme.textColor,
              padding: '24px'
          },
          title: {
              fontSize: '1.125rem'
          }
      }
    },
    MuiDialogTitle: {
      styleOverrides: {
          root: {
              color: theme.textColor,
              padding: '24px',
              fontSize: '1.125rem'
          }
      }
    },
  };
}
