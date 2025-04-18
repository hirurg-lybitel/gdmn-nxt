import MailingUpsert from '@gdmn-nxt/components/Mailing/mailing-upsert/mailing-upsert';
import SelectTemplate from '@gdmn-nxt/components/Mailing/select-template/select-template';
import PermissionsGate from '@gdmn-nxt/components/Permissions/permission-gate/permission-gate';
import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import StyledGrid from '@gdmn-nxt/components/Styled/styled-grid/styled-grid';
import CustomAddButton from '@gdmn-nxt/helpers/custom-add-button';
import CustomLoadingButton from '@gdmn-nxt/helpers/custom-loading-button/custom-loading-button';
import usePermissions from '@gdmn-nxt/helpers/hooks/usePermissions';
import SearchBar from '@gdmn-nxt/components/search-bar/search-bar';
import { IFilteringData, IMailing, IPaginationData, ISortingData, ITemplate, MailingStatus } from '@gsbelarus/util-api-types';
import { Box, Button, CardContent, CardHeader, Chip, ChipOwnProps, CircularProgress, Divider, IconButton, Stack, Typography } from '@mui/material';
import { GridColDef, GridSortModel } from '@mui/x-data-grid-pro';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAddMailingMutation, useDeleteMailingMutation, useGetAllMailingQuery, useLaunchMailingMutation, useUpdateMailingMutation } from '../../../features/Marketing/mailing';
import MenuBurger from '@gdmn-nxt/helpers/menu-burger';
import ItemButtonDelete from '@gdmn-nxt/components/customButtons/item-button-delete/item-button-delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import WarningIcon from '@mui/icons-material/Warning';
import ScheduleSendIcon from '@mui/icons-material/ScheduleSend';
import SendIcon from '@mui/icons-material/Send';
import PendingIcon from '@mui/icons-material/Pending';
import dayjs from '@gdmn-nxt/dayjs';
import { RootState } from '@gdmn-nxt/store';
import { useDispatch, useSelector } from 'react-redux';
import { saveFilterData } from '@gdmn-nxt/store/filtersSlice';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import { Recipients } from './recipients';
import CustomCardHeader from '@gdmn-nxt/components/customCardHeader/customCardHeader';

interface StatusChipProps extends ChipOwnProps {
  onClick?: () => void;
}

const StatusChip = ({
  ...props
}: StatusChipProps) => {
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

const filterEntityName = 'mailing';

export default function Mailing() {
  const userPermissions = usePermissions();

  const [paginationData, setPaginationData] = useState<IPaginationData>({
    pageNo: 0,
    pageSize: 20,
  });

  const [sortingData, setSortingData] = useState<ISortingData | null>();
  const filterData = useSelector((state: RootState) => state.filtersStorage.filterData?.[filterEntityName]);

  const {
    data: {
      mailings,
      count = 0,
    } = {
      count: 0,
      mailings: []
    },
    isLoading,
    isFetching,
    refetch
  } = useGetAllMailingQuery({
    pagination: paginationData,
    ...(filterData && { filter: filterData }),
    ...(sortingData ? { sort: sortingData } : {})
  }, { pollingInterval: 1000 * 60 });

  const [addMailing] = useAddMailingMutation();
  const [deleteMailing] = useDeleteMailingMutation();
  const [updateMailing, { isSuccess: updateMailingSuccess, data: updateMailingResponse }] = useUpdateMailingMutation();
  const [launchMailing] = useLaunchMailingMutation();

  const launch = useCallback((id: number) => () => launchMailing(id), []);

  const rowPerPage = 20;

  const pageOptions = [
    rowPerPage,
    rowPerPage * 2,
    rowPerPage * 5,
    rowPerPage * 10
  ];

  const dispatch = useDispatch();

  const saveFilters = useCallback((filteringData: IFilteringData) => {
    dispatch(saveFilterData({ [`${filterEntityName}`]: filteringData }));
  }, []);

  const handleFilteringDataChange = useCallback((newValue: IFilteringData) => saveFilters(newValue), []);

  const requestSearch = useCallback((value: string) => {
    const newObject = { ...filterData };
    delete newObject.name;
    handleFilteringDataChange({
      ...newObject,
      ...(value !== '' ? { name: [value] } : {})
    });
    setPaginationData(prev => ({ ...prev, pageNo: 0 }));
  }, [filterData]);

  const cancelSearch = useCallback(() => {
    const newObject = { ...filterData };
    delete newObject.name;
    handleFilteringDataChange(newObject);
  }, [filterData]);

  const columns: GridColDef<IMailing>[] = [
    { field: 'NAME', headerName: 'Наименование', flex: 1, minWidth: 200 },
    { field: 'STARTDATE', headerName: 'Дата запуска', width: 180,
      valueFormatter: ({ value }) => dayjs(value).isValid() ? dayjs(value).format('MMM DD, YYYY HH:mm') : ''
    },
    { field: 'STATUS', headerName: 'Статус', width: 170,
      renderCell({ value, id }) {
        switch (value) {
          case MailingStatus.delayed:
            return (
              <StatusChip
                color="warning"
                label="Отложена"
                icon={<ScheduleSendIcon/>}
              />);
          case MailingStatus.completed:
            return (
              <StatusChip
                color="success"
                label="Выполнена"
                icon={<CheckIcon />}
              />);
          case MailingStatus.error:
            return (
              <StatusChip
                color="error"
                label="Ошибка"
                icon={<WarningIcon />}
              />);
          case MailingStatus.manual:
            return (
              <StatusChip
                color="info"
                label="Запустить"
                icon={<SendIcon />}
                clickable
                onClick={launch(Number(id))}
              />);
          case MailingStatus.inProgress:
            return (
              <StatusChip
                label="В процессе"
                icon={<CircularProgress size={14} color="primary" />}
              />);
          case MailingStatus.launchNow:
            return (
              <StatusChip
                label="Запускается"
                icon={<CircularProgress size={14} color="primary" />}
              />);
          default:
            return 'Неизвестно';
        }
      },
    },
    { field: 'STATUS_DESCRIPTION', headerName: 'Описание', flex: 1, minWidth: 320,
      renderCell({ value, row }) {
        return (
          <Stack
            direction={'row'}
            spacing={1}
            alignItems={'center'}
          >
            <Typography variant="body2">{value}</Typography>
            {
              row.STATUS === MailingStatus.completed &&
              <Recipients
                mailingId={row.ID}
                quantity={row.recipientsCount ?? 0}
              />
            }
          </Stack>

        );
      }
    },
    {
      field: 'ACTIONS',
      headerName: '',
      type: 'actions',
      resizable: false,
      sortable: false,
      align: 'center',

      // renderCell: ({ id, row, api }) =>
      //   <MenuBurger
      //     items={[
      //       <Stack
      //         key="edit"
      //         direction="row"
      //         alignItems="center"
      //         spacing={1}
      //         onClick={onEdit(row)}
      //       >
      //         <EditIcon />
      //         <span>Редактировать</span>
      //       </Stack>,
      //       <PermissionsGate
      //         key="delete"
      //         actionAllowed={userPermissions?.mailings.DELETE}
      //         show
      //       >
      //         <ItemButtonDelete
      //           disabled
      //           label="Удалить"
      //           text={`Вы действительно хотите удалить рассылку ${row.NAME}?`}
      //           onClick={onDelete(Number(id))}
      //         />
      //       </PermissionsGate>
      //     ]}
      //   />,
      renderCell: ({ value, row }) => {
        return (
          <IconButton
            color="primary"
            size="small"
            onClick={onEdit(row)}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        );
      }
    }
  ];

  const [openWindow, setOpenWindow] = useState<{
    selectTempate: boolean;
    upsertMailing: boolean;
    mailing: IMailing | null
  }>({
    selectTempate: false,
    upsertMailing: false,
    mailing: null
  });

  const addMailingClick = () => setOpenWindow(prev => ({ ...prev, selectTempate: true }));

  const selectTemplateCancel = () => setOpenWindow(prev => ({ ...prev, selectTempate: false }));

  const selectTemplate = (selectedTemplate: ITemplate) => {
    setOpenWindow(prev => ({
      ...prev,
      selectTempate: false,
      upsertMailing: true,
      mailing: {
        ID: -1,
        NAME: '',
        TEMPLATE: selectedTemplate.HTML
      }
    }));
  };

  const mailingUpsertCancel = () => setOpenWindow(prev => ({ ...prev, upsertMailing: false }));

  const mailingUpsertSubmit = (mailing: IMailing, deleting = false) => {
    mailingUpsertCancel();

    if (deleting) {
      deleteMailing(mailing.ID);
      return;
    }

    if (mailing.ID > 0) {
      updateMailing(mailing)
        .then(async (result) => {
          if (!('data' in result)) return;

          const status = result.data.STATUS;
          if (status !== MailingStatus.launchNow) return;

          await launchMailing(mailing.ID);
        });
      return;
    }

    addMailing(mailing);
  };


  const onEdit = (mailing: IMailing) => () => {
    setOpenWindow(prev => ({
      ...prev,
      selectTempate: false,
      upsertMailing: true,
      mailing
    }));
  };

  const memoSelectTemplate = useMemo(() =>
    <SelectTemplate
      open={openWindow.selectTempate}
      onCancel={selectTemplateCancel}
      onSelect={selectTemplate}
    />, [openWindow.selectTempate]);

  const memoMailingUpsert = useMemo(() =>
    <MailingUpsert
      open={openWindow.upsertMailing}
      mailing={openWindow.mailing}
      onCancel={mailingUpsertCancel}
      onSubmit={mailingUpsertSubmit}
    />, [openWindow.mailing, openWindow.upsertMailing]);

  return (
    <CustomizedCard style={{ flex: 1 }}>
      <CustomCardHeader
        search
        refetch
        title={'Рассылки'}
        isLoading={isLoading}
        isFetching={isFetching}
        onCancelSearch={cancelSearch}
        onRequestSearch={requestSearch}
        searchValue={filterData?.name?.[0]}
        onRefetch={refetch}
        addButton={userPermissions?.contacts?.POST}
        onAddClick={addMailingClick}
        addButtonHint="Создать рассылку"
      />
      <Divider />
      <CardContent style={{ padding: 0 }}>
        <StyledGrid
          loading={isLoading}
          columns={columns}
          rows={mailings}
          pagination
          pageSizeOptions={pageOptions}
          paginationModel={{ page: paginationData.pageNo, pageSize: paginationData?.pageSize }}
          onSortModelChange={(sortModel: GridSortModel) => setSortingData(sortModel.length > 0 ? { ...sortModel[0] } : null)}
          onPaginationModelChange={(data: {page: number, pageSize: number}) => {
            setPaginationData({
              ...paginationData,
              pageSize: data.pageSize,
              pageNo: data.page
            });
          }}
          rowCount={count}
          paginationMode="server"
          sortingMode="server"
        />
      </CardContent>
      {memoSelectTemplate}
      {memoMailingUpsert}
    </CustomizedCard>
  );
};
