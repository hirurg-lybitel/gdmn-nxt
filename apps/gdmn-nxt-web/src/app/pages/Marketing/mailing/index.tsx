import MailingUpsert from '@gdmn-nxt/components/Mailing/mailing-upsert/mailing-upsert';
import SelectTemplate from '@gdmn-nxt/components/Mailing/select-template/select-template';
import PermissionsGate from '@gdmn-nxt/components/Permissions/permission-gate/permission-gate';
import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import StyledGrid from '@gdmn-nxt/components/Styled/styled-grid/styled-grid';
import CustomAddButton from '@gdmn-nxt/components/helpers/custom-add-button';
import CustomLoadingButton from '@gdmn-nxt/components/helpers/custom-loading-button/custom-loading-button';
import usePermissions from '@gdmn-nxt/components/helpers/hooks/usePermissions';
import SearchBar from '@gdmn-nxt/components/search-bar/search-bar';
import { IMailing, ITemplate, MailingStatus } from '@gsbelarus/util-api-types';
import { Box, CardContent, CardHeader, Divider, IconButton, Stack, Typography } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid-pro';
import { useMemo, useState } from 'react';
import { useAddMailingMutation, useDeleteMailingMutation, useGetAllMailingQuery, useUpdateMailingMutation } from '../../../features/Marketing/mailing';
import MenuBurger from '@gdmn-nxt/components/helpers/menu-burger';
import ItemButtonDelete from '@gdmn-nxt/components/item-button-delete/item-button-delete';
import EditIcon from '@mui/icons-material/Edit';

export default function Mailing() {
  const userPermissions = usePermissions();

  const { data: {
    mailings,
    count
  } = {
    count: 0,
    mailings: []
  },
  isLoading,
  isFetching,
  refetch
  } = useGetAllMailingQuery();

  const [addMailing] = useAddMailingMutation();
  const [deleteMailing] = useDeleteMailingMutation();
  const [updateMailing] = useUpdateMailingMutation();

  const columns: GridColDef<IMailing>[] = [
    { field: 'NAME', headerName: 'Наименование', flex: 1, },
    { field: 'DATE', headerName: 'Дата запуска', width: 150 },
    { field: 'STATUS', headerName: 'Статус', width: 200,
      valueGetter({ value }) {
        switch (value) {
          case MailingStatus.delayed:
            return 'Отложена';
          case MailingStatus.completed:
            return 'Выполнена';
          case MailingStatus.error:
            return 'Ошибка';
          case MailingStatus.manual:
            return 'Готова к запуску';
          case MailingStatus.inProgress:
            return 'В процессе';
          case MailingStatus.launchNow:
            return 'Запускается';
          default:
            return 'Неизвестно';
        }
      }
    },
    {
      field: 'ACTIONS',
      headerName: '',
      resizable: false,
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
    console.log('mailingUpsertSubmit', mailing);
    mailingUpsertCancel();

    if (deleting) {
      deleteMailing(mailing.ID);
      return;
    }

    if (mailing.ID > 0) {
      updateMailing(mailing);
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
      <CardHeader
        title={<Typography variant="pageHeader">Рассылки</Typography>}
        action={
          <Stack direction="row" spacing={1}>
            <Box paddingX={'4px'} />
            <SearchBar
              // disabled={personsIsFetching}
              // onCancelSearch={cancelSearch}
              // onRequestSearch={requestSearch}
              fullWidth
              cancelOnEscape
              // value={
              //   filterData?.name
              //     ? filterData.name[0]
              //     : undefined
              // }
            />
            <Box display="inline-flex" alignSelf="center">
              <PermissionsGate actionAllowed={userPermissions?.contacts?.POST}>
                <CustomAddButton
                  // disabled={contractsIsFetching}
                  // disabled
                  label="Создать рассылку"
                  onClick={addMailingClick}
                />
              </PermissionsGate>
            </Box>
            <Box display="inline-flex" alignSelf="center">
              <CustomLoadingButton
                hint="Обновить данные"
                onClick={() => refetch()}
                loading={isFetching}
              />
            </Box>
          </Stack>
        }
      />
      <Divider />
      <CardContent style={{ padding: 0 }}>
        <StyledGrid
          loading={isFetching}
          columns={columns}
          rows={mailings}
          paginationMode="server"
          sortingMode="server"
          pagination
          rowCount={count}
        />
      </CardContent>
      {memoSelectTemplate}
      {memoMailingUpsert}
    </CustomizedCard>
  );
};
