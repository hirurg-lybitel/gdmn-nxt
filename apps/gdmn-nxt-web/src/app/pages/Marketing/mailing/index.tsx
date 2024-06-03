import MailingUpsert from '@gdmn-nxt/components/Mailing/mailing-upsert/mailing-upsert';
import SelectTemplate from '@gdmn-nxt/components/Mailing/select-template/select-template';
import PermissionsGate from '@gdmn-nxt/components/Permissions/permission-gate/permission-gate';
import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import StyledGrid from '@gdmn-nxt/components/Styled/styled-grid/styled-grid';
import CustomAddButton from '@gdmn-nxt/components/helpers/custom-add-button';
import CustomLoadingButton from '@gdmn-nxt/components/helpers/custom-loading-button/custom-loading-button';
import usePermissions from '@gdmn-nxt/components/helpers/hooks/usePermissions';
import SearchBar from '@gdmn-nxt/components/search-bar/search-bar';
import { IMailing, ITemplate } from '@gsbelarus/util-api-types';
import { Box, CardContent, CardHeader, Divider, Stack, Typography } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid-pro';
import { useMemo, useState } from 'react';
import { useGetAllMailingQuery } from '../../../features/Marketing/mailing';

export default function Mailing() {
  const userPermissions = usePermissions();

  const { data: {
    mailings,
    count
  } = {
    count: 0,
    mailings: []
  },
  isFetching,
  refetch
  } = useGetAllMailingQuery();

  const columns: GridColDef<IMailing>[] = [
    { field: 'NAME', headerName: 'Наименование', flex: 1, },
    { field: 'DATE', headerName: 'Дата запуска', width: 150 },
    { field: 'STATUS', headerName: 'Статус', width: 200,
      valueGetter({ value }) {
        switch (value) {
          case 0:
            return 'Отложена';
          case 1:
            return 'Выполнена';
          case 2:
            return 'Ошибка';
          default:
            return 'Неизвестно';
        }
      }, },
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
    if (deleting) {
      /** Здесь удаляем рассылку */
      return;
    }

    if (mailing.ID > 0) {
      /** Здесь обновляем рассылку */
      return;
    }
    /** Здесь создаём рассылку */
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
          columns={columns}
          rows={mailings}
          pagination
        />
      </CardContent>
      {memoSelectTemplate}
      {memoMailingUpsert}
    </CustomizedCard>
  );
};
