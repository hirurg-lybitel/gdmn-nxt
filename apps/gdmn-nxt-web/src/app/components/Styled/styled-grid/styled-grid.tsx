import { DataGridPro } from '@mui/x-data-grid-pro';
import { styled } from '@mui/system';
import styles from './styled-grid.module.less';

const defaultTheme = {
  border: 'none',
  padding: '0px',
  '& .MuiDataGrid-columnHeader, .MuiDataGrid-cell': {
    padding: '24px',
  },
};

/* eslint-disable-next-line */
export interface StyledGridProps {}

const StyledGrid = styled(DataGridPro, {
  shouldForwardProp: (prop) => prop !== 'borders' && prop !== 'boxShadows'
})<StyledGridProps>(({ theme }) => ({
  ...defaultTheme
}));

export default StyledGrid;
