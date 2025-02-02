import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, ClickAwayListener, Fade, IconButton, Popper, Stack, Tooltip, Typography } from '@mui/material';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useGetCustomersBySegmentMutation } from 'apps/gdmn-nxt-web/src/app/features/Marketing/segments/segmentsApi';
import { ICustomer, ISegment } from '@gsbelarus/util-api-types';
import { GridColDef } from '@mui/x-data-grid-pro';
import StyledGrid from '@gdmn-nxt/components/Styled/styled-grid/styled-grid';
import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import CustomerEdit from 'apps/gdmn-nxt-web/src/app/customers/customer-edit/customer-edit';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

interface SegmentCustomersProps {
  label?: string;
  segment: ISegment;
}

const SegmentCustomers = ({
  label = 'Клиенты',
  segment
}: SegmentCustomersProps) => {
  const [expandedList, setExpandedList] = useState(false);

  const anchorRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback(() => setExpandedList(prev => !prev), []);

  const handleOnClose = useCallback(() => setExpandedList(false), []);

  return (
    <Stack flex={1}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.5}
        onClick={handleClick}
        justifyContent={'right'}
        flex={1}
        ref={anchorRef}
      >
        <Typography variant="body2">
          {label}
        </Typography>
        <Tooltip title={expandedList ? '' : 'Раскрыть список клиентов'} arrow>
          <IconButton
            size="small"
            style={{ padding: 0 }}
            color="inherit"
          >
            {
              expandedList
                ? <KeyboardArrowDownIcon fontSize="small" />
                : <KeyboardArrowRightIcon fontSize="small" />
            }
          </IconButton>
        </Tooltip>
      </Stack>
      <ExpandedList
        open={expandedList}
        segment={segment}
        anchorEl={anchorRef}
        onClose={handleOnClose}
      />
    </Stack>
  );
};

interface ExpandedListProps {
  open: boolean;
  segment: ISegment;
  anchorEl: RefObject<HTMLDivElement>;
  onClose: () => void;
}

const ExpandedList = ({
  open,
  segment,
  anchorEl,
  onClose
}: ExpandedListProps) => {
  const [getCustomers, { isLoading: customersLoading }] = useGetCustomersBySegmentMutation();

  const [customers, setCustomers] = useState<ICustomer[]>([]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const fetchCount = async () => {
      const response = await getCustomers({
        includeSegments: [segment],
        excludeSegments: [],
      });

      if (!('data' in response)) {
        return;
      }

      setCustomers(response.data ?? []);
    };
    fetchCount();
  }, [open, segment]);

  const onClickAway = () => onClose && onClose();

  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | null>(null);

  const handleEditCustomer = useCallback((customer: ICustomer) => () => setSelectedCustomer(customer), []);
  const handleCancelCustomer = useCallback(() => setSelectedCustomer(null), []);
  const handleSubmitCustomer = useCallback((customer: ICustomer, deleteable: boolean) => setSelectedCustomer(null), []);

  const columns: GridColDef<ICustomer>[] = [
    {
      field: 'NAME',
      headerName: 'Наименование',
      flex: 1,
      renderCell: ({ value, row }) => (
        <Stack
          direction={'row'}
          alignItems={'center'}
          flex={1}
          sx={{
            '& > .action': {
              display: 'none',
              flex: 1
            },
          }}
        >
          <Stack>
            <Typography variant="body2">{value}</Typography>
            {/* <Typography variant="caption">{row.EMAIL}</Typography> */}
          </Stack>
          <div
            className="action"
          >
            <Box flex={1} />
            <Tooltip key={0} title={'Картчока клиента'}>
              <IconButton color="primary" onClick={handleEditCustomer(row)}>
                <OpenInNewIcon />
              </IconButton>
            </Tooltip>
          </div>
        </Stack>
      ),
    },
  ];


  const memoCustomerEdit = useMemo(() =>
    <CustomerEdit
      open={!!selectedCustomer}
      readOnly={true}
      deleteable={false}
      customer={selectedCustomer}
      onCancel={handleCancelCustomer}
      onSubmit={handleSubmitCustomer}
    />, [selectedCustomer]);


  const rowHeight = 45;
  const maxLines = 11;

  return (
    <Popper
      open={open}
      anchorEl={anchorEl.current}
      placement="bottom-end"
      transition
    >
      {({ TransitionProps }) => (
        <ClickAwayListener onClickAway={onClickAway}>
          <Fade {...TransitionProps} timeout={350}>
            <CustomizedCard
              borders
              boxShadows
              style={{
                backgroundColor: 'var(--color-main-bg)',
                width: 400
              }}
            >
              <div
                style={{
                  height: open ? customers.length * rowHeight : '1px',
                  visibility: open ? 'visible' : 'hidden',
                  maxHeight: maxLines * rowHeight,
                  transition: 'height 0.5s, visibility  0.5s'
                }}
              >
                {memoCustomerEdit}
                <StyledGrid
                  sx={{
                    '& .MuiDataGrid-footerContainer': {
                      height: rowHeight,
                      minHeight: rowHeight,
                    },
                    '& .MuiDataGrid-row:hover .action': {
                      display: 'flex',
                    }
                  }}
                  rowHeight={rowHeight}
                  loading={customersLoading}
                  rows={customers}
                  columns={columns}
                  hideColumnHeaders
                  disableRowSelectionOnClick
                  initialState={{
                    pagination: {
                      paginationModel: {
                        page: 0,
                        pageSize: 10,
                      },
                    },
                  }}
                  hideFooter={customers.length < maxLines}
                  pagination={customers.length >= maxLines}
                />
              </div>
            </CustomizedCard>
          </Fade>
        </ClickAwayListener>
      )}
    </Popper>
  );
};

export default SegmentCustomers;
