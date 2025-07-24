import { ColorMode } from '@gsbelarus/util-api-types';
import { Components, Theme, Input } from '@mui/material';
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
          '--color-card-bg': theme.palette?.mode === ColorMode.Dark ? '#434343' : '#f0f0f0',
          '--color-main-bg': theme.palette.background.default,
          '--color-paper-bg': theme.palette.background.paper,
          '--color-borders': theme.mainContent.borderColor,
          '--color-grid-borders': theme.palette.mode === 'dark' ? 'rgba(81, 81, 81, 1)' : 'rgba(224, 224, 224, 1)',
          '--color-hihglight-bg': 'yellow',
          '--color-error': theme.palette.mode === 'dark' ? 'rgb(143, 64, 64)' : 'rgb(205, 92, 92)',
          '--color-disabled': 'rgba(255, 255, 255, 0.3)',
          '--border-radius': theme.mainContent.borderRadius,
          '--btn-border-radius': '6px',
          '--label-border-radius': '2em',
          '--menu-width': `${theme.drawerWidth}px`,
          '--tabs-height': '40px',
        },
        body: {
          fontFamily: theme.fontFamily,
          backgroundColor: theme.menu?.backgroundColor,
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            width: 10,
            height: 10,
            borderRadius: 'var(--border-radius)',
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
            borderRadius: 'var(--border-radius)',
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
        root: {
          '&.Mui-focused': {
            '& .MuiAutocomplete-input': {
              minWidth: '30px'
            }
          },
        },
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
          borderRadius: 'var(--border-radius)',
        },
      }
    },
    MuiButton: {
      defaultProps: {
        size: 'small',
        style: {
          textTransform: 'none',
          borderRadius: 'var(--btn-border-radius)'
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
          borderRadius: 'var(--border-radius)',
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
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          // borderRadius: 'var(--border-radius)',
        }
      }
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 'var(--tabs-height)'
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: 'var(--tabs-height)',
          textTransform: 'none',
          fontSize: '0.9375rem'
        }
      }
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: '0.75rem'
        }
      }
    },
    MuiIconButton: {
      defaultProps: {
        size: 'small'
      },
    },
    MuiSelect: {
      defaultProps: {
        size: 'small'
      }
    },
    MuiInputLabel: {
      defaultProps: {
        size: 'small'
      }
    }
  };
}
