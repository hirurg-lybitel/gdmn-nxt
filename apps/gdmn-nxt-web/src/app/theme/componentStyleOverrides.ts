import { ColorMode } from '@gsbelarus/util-api-types';
import { Components, Theme } from '@mui/material';
import * as locales from '@mui/material/locale';

export default function componentStyleOverrides(theme: Theme): Components {
  return {
    MuiCssBaseline: {
      styleOverrides: {
        ':root': {
          '--color-scroll-thumb': theme.palette?.mode === ColorMode.Dark ? '#93999c' : '#d1dbe3',
          '--color-scroll-thumb-hover': theme.palette?.mode === ColorMode.Dark ? '#717171' : '#959595',
          '--color-input-text': theme.textColor,
          '--color-btn-primary-bg': theme.mainContent.buttonPrimaryColor,
          '--color-primary-bg': theme.palette.primary.main,
          '--border-radius': theme.mainContent.borderRadius,
          '--menu-width': `${theme.drawerWidth}px`,
        },
        body: {
          fontFamily: theme.fontFamily,
          backgroundColor: theme.menu?.backgroundColor,
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            width: 10,
            height: 10,
            borderRadius: theme.mainContent.borderRadius,
            backgroundColor: 'inherit',
          },
          '&::-webkit-scrollbar:hover, & *::-webkit-scrollbar:hover': {
            backgroundColor: theme.palette?.mode === ColorMode.Dark ? 'rgba(15, 15, 15, 0.5)' : '#eee',
          },
          // '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
          //   marginTop: '2px',
          //   marginBottom: '2px',
          //   backgroundColor: 'inherit',
          // },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: theme.mainContent.borderRadius,
            backgroundColor: 'var(--color-scroll-thumb)',
            border: '2px solid transparent',
            backgroundClip: 'padding-box',
          },
          '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
            backgroundColor: 'var(--color-scroll-thumb-hover)',
          },
          '&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus': {
            backgroundColor: 'var(--color-scroll-thumb-hover)',
          }
        }
      }
    },
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
    MuiAutocomplete: {
      ...locales.ruRU.components?.MuiAutocomplete,
      defaultProps: {
        size: 'small',
        noOptionsText: 'Нет данных'
      },
      styleOverrides: {
        paper: {
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          boxShadow: '0px 4px 5px -2px rgb(0 0 0 / 20%), 0px 7px 10px 1px rgb(0 0 0 / 14%), 0px 2px 16px 1px rgb(0 0 0 / 12%)',
        }
      }
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        rounded: {
          borderRadius: '12px',
        },
      }
    },
    MuiButton: {
      defaultProps: {
        size: 'small',
        style: {
          textTransform: 'none',
        }
      },
      styleOverrides: {
        text: {
          letterSpacing: '1px'
        },
        contained: ({ ownerState: { color } }) => (
          color === 'primary' && {
            backgroundColor: 'var(--color-btn-primary-bg)',
            ':hover': {
              backgroundColor: 'var(--color-btn-primary-bg)',
              opacity: 0.9
            }
          }),
        outlined: {
          letterSpacing: '1px'
        },
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
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
        }
      }
    },
    MuiTextField: {
      defaultProps: {
        size: 'small'
      }
    },
    MuiCheckbox: {
      defaultProps: {
        size: 'small'
      }
    },
    MuiSvgIcon: {
      defaultProps: {
        fontSize: 'small'
      }
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          '& .MuiSwitch-thumb': {
            boxShadow: '0 0 5px grey'
          }
        }
      }
    },
    MuiAlert: {
      defaultProps: {
        variant: theme.palette?.mode === ColorMode.Dark ? 'filled' : 'standard'
      }
    }
  };
}
