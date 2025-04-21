import { TablePagination, TablePaginationProps, useMediaQuery, useTheme } from '@mui/material';

export default function CustomTablePagination(props: TablePaginationProps) {
  const theme = useTheme();
  const matchDownSm = useMediaQuery(theme.breakpoints.down('sm'));
  return <TablePagination {...props} labelRowsPerPage={matchDownSm ? '' : props.labelRowsPerPage} />;
}
