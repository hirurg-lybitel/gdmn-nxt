import { Box, Chip, ChipOwnProps, ClickAwayListener, Fade, IconButton, Popper, Stack, Tooltip, Typography } from '@mui/material';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import { MouseEvent, MouseEventHandler, PropsWithRef, useCallback, useEffect, useMemo, useState } from 'react';
import { ICustomer, IFilteringData, IMailingHistory, IPaginationData, MailingStatus } from '@gsbelarus/util-api-types';
import { GridColDef } from '@mui/x-data-grid-pro';
import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import CustomerEdit from '../../../customers/customer-edit/customer-edit';
import StyledGrid, { renderCellExpand } from '@gdmn-nxt/components/Styled/styled-grid/styled-grid';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useGetMailingHistoryQuery } from '../../../features/Marketing/mailing';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@gdmn-nxt/store';
import { saveFilterData } from '@gdmn-nxt/store/filtersSlice';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

interface StyledChipProps extends PropsWithRef<ChipOwnProps> {
  onClick?: MouseEventHandler<HTMLDivElement>;
}

const StyledChip = ({
  ...props
}: StyledChipProps) => {
  return (
    <Chip
      {...props}
      variant="outlined"
      size="small"
      sx={{
        paddingLeft: 1,
        paddingRight: 1
      }}
    />
  );
};

const filterEntityName = 'mailing-history';

interface RecipientsProps {
  mailingId: number;
  quantity?: number;
}

export const Recipients = ({
  mailingId,
  quantity
}: Readonly<RecipientsProps>) => {
  const [open, setOpen] = useState(false);
  const [anchorRef, setAnchorRef] = useState<null | HTMLDivElement>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | null>(null);

  const handleEditCustomer = useCallback((customer: ICustomer) => () => setSelectedCustomer(customer), []);
  const handleCancelCustomer = useCallback(() => setSelectedCustomer(null), []);
  const handleSubmitCustomer = useCallback((customer: ICustomer, deleteable: boolean) => setSelectedCustomer(null), []);

  const onClickAway = useCallback(() => setOpen(false), []);

  const chipClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
    setAnchorRef(e.currentTarget);
    filteringDataChange({
      ...filterData,
      mailingId
    });
    setOpen(prev => !prev);
  }, [mailingId]);


  const dispatch = useDispatch();
  const [paginationData, setPaginationData] = useState<IPaginationData>({
    pageNo: 0,
    pageSize: 10,
  });

  const filterData = useSelector((state: RootState) => state.filtersStorage.filterData?.[filterEntityName]);

  const saveFilters = useCallback((filteringData: IFilteringData) => {
    dispatch(saveFilterData({ [filterEntityName]: filteringData }));
  }, []);

  const filteringDataChange = useCallback((newValue: IFilteringData) => saveFilters(newValue), []);

  const { data: {
    history: mailingHistory = [],
    count = 0 } = {
    history: [], count: 0
  },
  isLoading: mailingHistoryLoading
  } = useGetMailingHistoryQuery({
    pagination: paginationData,
    ...(filterData && { filter: filterData }),
  }, {
    skip: !open,
    refetchOnMountOrArgChange: true
  });

  useEffect(() => {
    if (open) return;

    setPaginationData({
      pageNo: 0,
      pageSize: 10,
    });
  }, [open]);


  const columns: GridColDef<IMailingHistory>[] = [
    {
      field: 'status',
      width: 50,
      renderCell: ({ value, row: { description } }) => (
        value === MailingStatus.completed
          ? <CheckCircleOutlineIcon color="success" />
          : <Tooltip title={description}><ErrorOutlineIcon color="error" /></Tooltip>),
    },
    {
      field: 'customer',
      headerName: 'Наименование',
      flex: 1,
      renderCell: ({ value, ...params }) => (
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
            <Box maxWidth={370}>
              {renderCellExpand(params, value?.NAME)}
            </Box>
            <Typography variant="caption">{value.EMAIL}</Typography>
          </Stack>
          <div
            className="action"
          >
            <Box flex={1} />
            <Tooltip key={0} title={'Картчока клиента'}>
              <IconButton color="primary" onClick={handleEditCustomer(value)}>
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


  const rowHeight = 50;
  const maxLines = 11;

  return (
    <>
      <StyledChip
        onClick={chipClick}
        color="default"
        clickable
        label={`Получатели: ${quantity}`}
        icon={<ContactMailIcon />}
      />

      <Popper
        open={open}
        anchorEl={anchorRef}
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
                  width: 500
                }}
              >
                <div
                  style={{
                    height: open ? (count === 0 ? 5 : count) * rowHeight : '1px',
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
                    getRowId={row => row.id}
                    rowHeight={rowHeight}
                    loading={mailingHistoryLoading}
                    rows={mailingHistory}
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
                    hideFooter={count < maxLines}
                    pagination={count >= maxLines}
                    paginationMode="server"
                    paginationModel={{ page: paginationData.pageNo, pageSize: paginationData?.pageSize }}
                    onPaginationModelChange={(data: {page: number, pageSize: number}) => {
                      setPaginationData({
                        ...paginationData,
                        pageSize: data.pageSize,
                        pageNo: data.page
                      });
                    }}
                    rowCount={count}
                  />
                </div>
              </CustomizedCard>
            </Fade>
          </ClickAwayListener>
        )}
      </Popper>
    </>
  );
};
