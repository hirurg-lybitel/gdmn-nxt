import EditIcon from '@mui/icons-material/Edit';
import StyledGrid from '@gdmn-nxt/components/Styled/styled-grid/styled-grid';
import styles from './contact-list.module.less';
import { IconButton, List, ListItemButton, Stack, Tooltip, Typography } from '@mui/material';
import { IContactPerson, IEmail, ILabel, IPaginationData, IPhone } from '@gsbelarus/util-api-types';
import LabelMarker from '@gdmn-nxt/components/Labels/label-marker/label-marker';
import { GridColumns } from '@mui/x-data-grid-pro';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { saveFilterData } from '../../../store/filtersSlice';

export interface ContactListProps {
  contacts: IContactPerson[];
  contactsCount: number;
  isLoading: boolean;
  onEditClick: (contact: IContactPerson) => void;
  paginationData: IPaginationData;
  paginationClick: (data: IPaginationData) => void;
}

export function ContactList({
  contacts = [],
  contactsCount = 0,
  isLoading = false,
  onEditClick,
  paginationData,
  paginationClick
}: ContactListProps) {
  const [pageOptions, setPageOptions] = useState<number[]>([]);

  useEffect(() => {
    const rowPerPage = 20;
    setPageOptions([
      rowPerPage,
      rowPerPage * 2,
      rowPerPage * 5,
      rowPerPage * 10
    ]);
  }, [paginationData]);

  const itemEditClick = (contact: IContactPerson) => () => onEditClick(contact);

  const dispatch = useDispatch();
  const filterData = useSelector((state: RootState) => state.filtersStorage.filterData?.contacts);
  const handleLabelClick = useCallback(
    (label: ILabel) => () => {
      if (filterData?.['LABELS']?.findIndex((l: ILabel) => l.ID === label.ID) >= 0) return;
      dispatch(saveFilterData({ 'contacts': { ...filterData, 'LABELS': [...filterData?.['LABELS'] || [], label] } }));
    },
    [filterData]
  );

  const columns: GridColumns<IContactPerson> = [
    {
      field: 'NAME', headerName: 'Имя', flex: 1, minWidth: 200,
      renderCell: ({ value, row }) => {
        const labels: ILabel[] = row.LABELS ?? [];
        return (
          <Stack
            spacing={1}
            direction="row"
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <Typography>{value}</Typography>
            {Array.isArray(labels)
              ?
              <List
                style={{
                  flexDirection: 'row',
                  padding: '0px',
                  width: 'fit-content',
                  display: 'flex',
                  flexWrap: 'wrap',
                  columnGap: '5px',
                  alignItems: 'center'
                }}
              >
                {labels.map((label) => {
                  return (
                    <div key={label.ID}>
                      <Tooltip
                        arrow
                        placement="bottom-start"
                        title={label.USR$DESCRIPTION}
                      >
                        <ListItemButton
                          key={label.ID}
                          onClick={handleLabelClick(label)}
                          sx={{
                            padding: '2.5px 0px',
                          }}
                        >
                          <LabelMarker label={label} />
                        </ListItemButton>
                      </Tooltip>
                    </div>
                  );
                }
                )}
                {/* {labels.length > 1 && <Typography variant="caption">+{labels.length - 1}</Typography>} */}
              </List>
              : <></>}
          </Stack>
        );
      }
    },
    {
      field: 'PHONES', headerName: 'Телефон', width: 150,
      renderCell: ({ value: phones }) => {
        return (
          <Stack>
            {phones?.slice(0, 2)?.map((phone: IPhone) => <Typography key={phone.ID} variant="caption">{phone.USR$PHONENUMBER}</Typography>)}
          </Stack>);
      }
    },
    {
      field: 'EMAILS', headerName: 'Email', width: 200,
      renderCell: ({ value: emails }) => {
        return (
          <Stack>
            {emails?.slice(0, 2)?.map((email: IEmail) => <Typography key={email.ID} variant="caption">{email.EMAIL}</Typography>)}
          </Stack>);
      }
    },
    {
      field: 'actions',
      type: 'actions',
      resizable: false,
      // width: 50,
      getActions: ({ row }) => [
        Object.keys(row).length > 0
          ? <>
            {/* <PermissionsGate actionAllowed={userPermissions?.deals.PUT}> */}
            <IconButton
              key={1}
              color="primary"
              size="small"
              onClick={itemEditClick(row)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            {/* </PermissionsGate> */}
          </>
          : <></>
      ]
    }
    // { field: 'DOCUMENTDATE', headerName: 'Дата', width: 100, type: 'date',
    //   renderCell: ({ value }) => value.toLocaleString('default', { day: '2-digit', month: '2-digit', year: '2-digit' })
    // },
    // { field: 'DEPT_NAME', headerName: 'Отдел', width: 100 },
    // { field: 'JOB_NUMBER', headerName: 'Заказ', width: 100 },
    // { field: 'CSUMNCU', headerName: 'Сумма', minWidth: 100, align: 'right',
    //   renderCell: ({ value }) => (Math.round(value * 100) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 }) },
    // { field: 'COMMENT', headerName: 'Комментарии', flex: 1, minWidth: 300,
    //   renderCell: ({ value }) => <Box style={{ width: '100%', whiteSpace: 'initial' }}>{value}</Box>
    // }
  ];

  return (
    <>
      <StyledGrid
        rows={contacts}
        columns={columns}
        onRowDoubleClick={({ row }) => onEditClick(row)}
        getRowHeight={(params) => {
          if (!params.model.LABELS) {
            return 40;
          }
          return 'auto';
        }}
        loading={isLoading}
        rowCount={contactsCount}
        hideHeaderSeparator
        disableMultipleSelection
        hideFooterSelectedRowCount
        disableColumnResize
        disableColumnReorder
        disableColumnFilter
        disableColumnMenu
        pagination
        paginationMode="server"
        onPageChange={(data) => {
          paginationClick({
            ...paginationData,
            pageNo: data
          });
          // setPaginationData((prevState) => ({
          //   ...prevState,
          //   pageNo: data
          // }));
        }}
        onPageSizeChange={(data) => {
          paginationClick({
            ...paginationData,
            pageSize: data
          });
          // setPaginationData((prevState) => ({
          //   ...prevState,
          //   pageSize: data
          // }));
        }}
        pageSize={paginationData.pageSize}
        rowsPerPageOptions={pageOptions}
        sortingMode="server"
      />
    </>
  );
}

export default ContactList;
