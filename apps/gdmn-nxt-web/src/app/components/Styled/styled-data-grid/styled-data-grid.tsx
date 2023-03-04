import * as React from 'react';
import { DataGridPro, gridPageCountSelector, gridPageSelector, useGridApiContext, useGridSelector } from '@mui/x-data-grid-pro';
import { Theme, styled } from '@mui/material/styles';
import Pagination from '@mui/material/Pagination';
import PaginationItem from '@mui/material/PaginationItem';
import { darken, lighten } from '@mui/material/styles';
import { createSvgIcon } from '@mui/material';
import { createElement } from 'react';
import { ColorMode } from '@gsbelarus/util-api-types';

export const gridComponents = {
  Pagination: CustomPagination,
  ColumnResizeIcon: createSvgIcon(createElement('path', { d: 'M11 24V0h2v24z' }), 'Separator2')
};

const getBackgroundColor = (color: string, mode: string) =>
  mode === ColorMode.Dark ? darken(color, 0.8) : lighten(color, 0.8);

const getSelectedBackgroundColor = (color: string, mode: string) =>
  mode === ColorMode.Dark ? darken(color, 0.6) : lighten(color, 0.6);

const getHoverBackgroundColor = (color: string, mode: string) =>
  mode === ColorMode.Dark ? darken(color, 0.4) : lighten(color, 0.4);

function customCheckbox(theme: Theme) {
  return {
    '& .MuiCheckbox-root svg': {
      width: 16,
      height: 16,
      backgroundColor: 'transparent',
      border: `1px solid ${
        theme.mainContent.borderColor
      }`,
      borderRadius: 2,
    },
    '& .MuiCheckbox-root svg path': {
      display: 'none',
    },
    '& .MuiCheckbox-root.Mui-checked:not(.MuiCheckbox-indeterminate) svg': {
      backgroundColor: '#1890ff',
      borderColor: '#1890ff',
    },
    '& .MuiCheckbox-root.Mui-checked .MuiIconButton-label:after': {
      position: 'absolute',
      display: 'table',
      border: '2px solid #fff',
      borderTop: 0,
      borderLeft: 0,
      transform: 'rotate(45deg) translate(-50%,-50%)',
      opacity: 1,
      transition: 'all .2s cubic-bezier(.12,.4,.29,1.46) .1s',
      content: '""',
      top: '50%',
      left: '39%',
      width: 5.71428571,
      height: 9.14285714,
    },
    '& .MuiCheckbox-root.MuiCheckbox-indeterminate .MuiIconButton-label:after': {
      width: 8,
      height: 8,
      backgroundColor: '#1890ff',
      transform: 'none',
      top: '39%',
      border: 0,
    },
  };
};

export const StyledDataGrid = styled(DataGridPro)(({ theme }) => ({
  border: 0,
  color:
    theme.textColor,
  fontFamily: [
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
  ].join(','),
  WebkitFontSmoothing: 'auto',
  letterSpacing: 'normal',
  '& .MuiDataGrid-columnsContainer': {
    backgroundColor: theme.palette.background.paper,
  },
  // '& .MuiDataGrid-iconSeparator': {
  //   display: 'none',
  // },
  '& .MuiDataGrid-columnHeaderTitle': {
    fontWeight: 600
  },
  '& .MuiDataGrid-columnHeader, .MuiDataGrid-cell': {
    borderRight: `1px solid ${
      theme.mainContent.borderColor
    }`,
  },
  '& .MuiDataGrid-columnsContainer, .MuiDataGrid-cell': {
    borderBottom: `1px solid ${
      theme.mainContent.borderColor
    }`,
  },
  '& .MuiDataGrid-row:nth-of-type(2n)': {
    backgroundColor: getBackgroundColor(theme.palette.primary.light, theme.palette.mode),
  },
  '& .MuiDataGrid-row:nth-of-type(2n):hover': {
    backgroundColor: getBackgroundColor(theme.palette.primary.light, theme.palette.mode),
  },
  '& .MuiDataGrid-row.Mui-selected': {
    backgroundColor: getSelectedBackgroundColor(theme.palette.primary.light, theme.palette.mode),
  },
  '& .MuiDataGrid-row.Mui-selected:hover': {
    backgroundColor: getSelectedBackgroundColor(theme.palette.primary.light, theme.palette.mode),
  },
  '& .MuiDataGrid-row:hover': {
    backgroundColor: 'inherit',
  },
  '& .MuiDataGrid-cell': {
    color:
      theme.textColor,
  },
  '& .MuiDataGrid-footerContainer': {
    minHeight: 32,
    borderTop: `1px solid ${
      theme.mainContent.borderColor
    }`, },
  '& .MuiPaginationItem-root': {
    height: 16,
    width: 16,
    fontSize: 12,
    borderRadius: 0,
  },
  ...customCheckbox(theme),
}));

export function CustomPagination() {
  const apiRef = useGridApiContext();
  const page = useGridSelector(apiRef, gridPageSelector);
  const pageCount = useGridSelector(apiRef, gridPageCountSelector);

  return (
    <Pagination
      color="primary"
      variant="outlined"
      shape="rounded"
      page={page + 1}
      count={pageCount}
      // @ts-expect-error
      renderItem={(props2) => <PaginationItem {...props2} disableRipple />}
      onChange={(event: React.ChangeEvent<unknown>, value: number) =>
        apiRef.current.setPage(value - 1)
      }
    />
  );
};
