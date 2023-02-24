import { styled } from '@mui/material/styles';
import { GridOverlay } from '@mui/x-data-grid-pro';
import { ThemeOptions } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';
import CustomNoData from '../../Icons/CustomNoData';

const StyledGridOverlay = styled(GridOverlay)(({ theme }) => ({
  flexDirection: 'column',
  backgroundColor: theme.palette.background.paper,
}));

export default function CustomNoRowsOverlay() {

  return (
    <StyledGridOverlay>
      <CustomNoData />
    </StyledGridOverlay>
  );
}
