import PermissionsGate from '@gdmn-nxt/components/Permissions/permission-gate/permission-gate';
import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import StyledGrid from '@gdmn-nxt/components/Styled/styled-grid/styled-grid';
import CustomAddButton from '@gdmn-nxt/components/helpers/custom-add-button';
import CustomLoadingButton from '@gdmn-nxt/components/helpers/custom-loading-button/custom-loading-button';
import usePermissions from '@gdmn-nxt/components/helpers/hooks/usePermissions';
import SearchBar from '@gdmn-nxt/components/search-bar/search-bar';
import { Box, CardContent, CardHeader, Divider, Stack, Typography } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid-pro';

// const mockData = [
//   {
//     ID: 1,
//     NAME: 'Акция!',
//     DATE: '22.01.2024',
//     STATUS: 0
//   },
//   {
//     ID: 2,
//     NAME: 'Новые услуги',
//     DATE: '22.01.2024',
//     STATUS: 1
//   },
//   {
//     ID: 3,
//     NAME: 'Продление сертификатов',
//     DATE: '22.01.2024',
//     STATUS: 2
//   }
// ];

const mockData = [
  {
    'ID': 949744288,
    'NAME': 'Рассылка №1',
    'LAUNCHDATE': null,
    'STATUS': 0,
    'segments': [
      {
        'ID': 949744270,
        'NAME': 'Выборка 22.04',
        'FIELDS': [
          {
            'NAME': 'LABELS',
            'VALUE': '949740115,949740116'
          }
        ],
        'QUANTITY': 2
      }
    ]
  },
  {
    'ID': 949744296,
    'NAME': 'Акция!',
    'LAUNCHDATE': null,
    'STATUS': 1,
    'segments': []
  },
  {
    'ID': 949744297,
    'NAME': 'Новые услуги',
    'LAUNCHDATE': null,
    'STATUS': 0,
    'segments': []
  },
  {
    'ID': 949744298,
    'NAME': 'Продление сертификатов',
    'LAUNCHDATE': null,
    'STATUS': 2,
    'segments': []
  }
];

export default function Mailing() {
  const userPermissions = usePermissions();

  const columns: GridColDef<any>[] = [
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
                  // onClick={() => setUpsertContact({ addContact: true })}
                />
              </PermissionsGate>
            </Box>
            <Box display="inline-flex" alignSelf="center">
              <CustomLoadingButton
                hint="Обновить данные"
                loading
                onClick={() => {}}
                // loading={personsIsFetching}
                // onClick={() => personsRefetch()}
              />
            </Box>
          </Stack>
        }
      />
      <Divider />
      <CardContent style={{ padding: 0 }}>
        <StyledGrid
          columns={columns}
          rows={mockData}
          pagination
        />
      </CardContent>
    </CustomizedCard>
  );
};
