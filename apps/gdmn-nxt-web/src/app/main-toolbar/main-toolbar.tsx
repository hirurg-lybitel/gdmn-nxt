import { Box, Stack } from '@mui/material';
import { gdmnTheme } from '../theme/gdmn-theme';
import styles from './main-toolbar.module.less';

interface ITBButtonProps {
  type: 'SMALL' | 'LARGE';
  imgSrc: string;
  caption: string;
  disabled?: boolean;
  selected?: boolean;
  onClick: () => void;
};

export const TBButton = ({ type, imgSrc, caption, disabled, selected, onClick }: ITBButtonProps) => {
  if (type === 'SMALL') {
    return (
      <Box
        onClick={onClick}
        sx={{
          display: 'table-cell',
          cursor: 'default',
          fontFamily: gdmnTheme.typography.body1.fontFamily,
          fontSize: gdmnTheme.typography.smallUI.fontSize,
          filter: disabled ? 'grayscale(100%) opacity(50%)' : 'none',
          border: selected ? '1px solid gray' : '1px solid transparent',
          backgroundColor: selected ? 'silver' : 'none',
          borderRadius: selected ? '4px' : 'none',
          padding: '4px'
        }}
      >
        <img src={imgSrc} style={{ verticalAlign: 'sub', marginRight: 4 }} />
        <span>{caption}</span>
      </Box>
    )
  } else {
    return (
      <Box
        onClick={onClick}
        sx={{
          display: 'table-cell',
          cursor: 'default',
          fontFamily: gdmnTheme.typography.body1.fontFamily,
          fontSize: gdmnTheme.typography.smallUI.fontSize,
          filter: disabled ? 'grayscale(100%) opacity(50%)' : 'none',
          border: selected ? '1px solid gray' : '1px solid transparent',
          backgroundColor: selected ? 'silver' : 'none',
          borderRadius: selected ? '4px' : 'none',
          padding: '4px'
        }}
      >
        <Stack
          direction="column"
          justifyContent="center"
          alignItems="center"
          sx={{
            cursor: 'default',
            flexBasis: 0,
            flexGrow: 1,
            }}>
          <img src={imgSrc} />
          <div>{caption}</div>
        </Stack>
      </Box>
    )
  }
};

/* eslint-disable-next-line */
export interface MainToolbarProps {
  children?: React.ReactNode;
};

export function MainToolbar({ children }: MainToolbarProps) {
  return (
    <div style={{
      width: '100%',
      backgroundColor: gdmnTheme.palette.grey['200'],
      paddingLeft: 8,
      paddingRight: 8,
      paddingBottom: 6,
      borderBottomWidth: 1,
      borderBottomStyle: 'solid',
      borderBottomColor: gdmnTheme.palette.grey['400'],
    }}>
      <div style={{
        width: '100%',
        height: 74,
        padding: 6,
        backgroundColor: gdmnTheme.palette.grey['100'],
        borderColor: gdmnTheme.palette.grey['400'],
        borderStyle: 'solid',
        borderWidth: 1,
        borderRadius: 5,
      }}>
        <table style={{
          tableLayout: 'fixed',
          width: 'auto'
        }}>
          <tbody>
            <tr>
              {children}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
