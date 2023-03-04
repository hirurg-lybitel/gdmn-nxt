import { ColorMode } from '@gsbelarus/util-api-types';
import { Box, LinearProgress, linearProgressClasses, useTheme } from '@mui/material';
import { styled } from '@mui/styles';
import styles from './linear-indeterminate.module.less';

/* eslint-disable-next-line */
export interface LinearIndeterminateProps {
  open: boolean;
  size?: number;
};

export function LinearIndeterminate(props: LinearIndeterminateProps) {
  const { open, size = '5px' } = props;

  const theme = useTheme();

  const BorderLinearProgress = styled(LinearProgress)(() => ({
    height: size,
    borderRadius: theme.mainContent.borderRadius,
    [`&.${linearProgressClasses.colorPrimary}`]: {
      backgroundColor: theme.palette.primary.main[theme.palette.mode === ColorMode.Light ? 200 : 800],
    },
    [`& .${linearProgressClasses.bar}`]: {
      borderRadius: 5,
      backgroundColor: theme.palette.primary.main,
    },
  }));

  return (
    <Box style={{ display: open ? 'block' : 'none', height: size }} >
      {/* <LinearProgress /> */}
      <BorderLinearProgress />
    </Box>
  );
}

export default LinearIndeterminate;
