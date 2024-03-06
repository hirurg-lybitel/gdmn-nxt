import { styled } from '@mui/material/styles';
import { GridOverlay } from '@mui/x-data-grid-pro';
import CustomNoData from '../../Icons/CustomNoData';

const StyledGridOverlay = styled(GridOverlay)(({ theme }) => ({
  flexDirection: 'column',
  backgroundColor: 'transparent',
}));

export default function CustomNoRowsOverlay() {
  return (
    <StyledGridOverlay>
      <CustomNoData />
    </StyledGridOverlay>
  );
}
