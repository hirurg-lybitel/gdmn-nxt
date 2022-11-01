import { DataGridPro, DataGridProProps, ruRU } from '@mui/x-data-grid-pro';
import { styled } from '@mui/system';
import styles from './styled-grid.module.less';
import { useDataGridProProps } from '@mui/x-data-grid-pro/DataGridPro/useDataGridProProps';
import CustomNoRowsOverlay from './DataGridProOverlay/CustomNoRowsOverlay';
import CustomLoadingOverlay from './DataGridProOverlay/CustomLoadingOverlay';

const defaultTheme = {
  border: 'none',
  padding: '0px',
  '& .MuiDataGrid-cell': {
    padding: '24px',
  },
  '& ::-webkit-scrollbar': {
    width: '6px',
    height: '6px',
    backgroundColor: 'transparent',
    borderRadius: '6px',
    // transition: 'background-color 5s linear, width 5s ease-in-out',
  },
  '& ::-webkit-scrollbar:hover': {
    backgroundColor: '#f0f0f0',
  },
  '& ::-webkit-scrollbar-thumb': {
    position: 'absolute',
    right: 10,
    borderRadius: '6px',
    backgroundColor: 'rgba(170, 170, 170, 0.5)',
  },
  '& ::-webkit-scrollbar-thumb:hover': {
    backgroundColor: '#999',
  },
};

export default function StyledGrid(props: DataGridProProps) {
  return (
    <DataGridPro
      localeText={ruRU.components.MuiDataGrid.defaultProps.localeText}
      getRowId={row => row.ID}
      components={{
        LoadingOverlay: CustomLoadingOverlay,
        NoRowsOverlay: CustomNoRowsOverlay,
        NoResultsOverlay: CustomNoRowsOverlay,
      }}
      {...props}
      sx={{
        ...defaultTheme,
        ...props.sx
      }}
    />
  );
};
