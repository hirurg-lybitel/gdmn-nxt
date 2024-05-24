import { SegmentUpsert } from '@gdmn-nxt/components/Segments/segment-upsert';
import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import StyledGrid from '@gdmn-nxt/components/Styled/styled-grid/styled-grid';
import CustomAddButton from '@gdmn-nxt/components/helpers/custom-add-button';
import CustomLoadingButton from '@gdmn-nxt/components/helpers/custom-loading-button/custom-loading-button';
import usePermissions from '@gdmn-nxt/components/helpers/hooks/usePermissions';
import SearchBar from '@gdmn-nxt/components/search-bar/search-bar';
import { ISegment } from '@gsbelarus/util-api-types';
import { Box, CardContent, CardHeader, Divider, Stack, Typography } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid-pro';
import { useMemo, useState } from 'react';

const mockData: ISegment[] = [
  {
    ID: 1,
    NAME: 'Favorite customers',
    QUANTITY: 48,
    FIELDS: []
  },
  {
    ID: 2,
    NAME: 'Offer on March 8',
    QUANTITY: 112,
    FIELDS: []
  }
];

export default function CustomersSegments() {
  const [upsertSegment, setUpsertSegment] = useState<{
    addSegment: boolean;
    editSegment?: boolean;
    segment?: any
  }>({
    addSegment: false,
    editSegment: false
  });

  const handleClose = () => {
    setUpsertSegment({ addSegment: false, editSegment: false });
  };

  const handleSegmentUpsertSubmit = async (segmant: any, deleting?: boolean) => {
    // deleting ? deletePerson(person.ID) : updatePerson(person);
    handleClose();
  };

  const columns: GridColDef<any>[] = [
    { field: 'NAME', headerName: 'Наименование', flex: 1, },
    { field: 'QUANTITY', headerName: 'Получатели', width: 150 },
  ];

  const memoSegmentEdit = useMemo(() =>
    <SegmentUpsert
      open={!!upsertSegment.editSegment}
      segment={upsertSegment.segment!}
      onSubmit={handleSegmentUpsertSubmit}
      onCancel={handleClose}
    />,
  [upsertSegment.editSegment, upsertSegment.segment]);

  const memoSegmentAdd = useMemo(() =>
    <SegmentUpsert
      open={!!upsertSegment.addSegment}
      onSubmit={handleSegmentUpsertSubmit}
      onCancel={handleClose}
    />,
  [upsertSegment.addSegment]);

  return (
    <CustomizedCard style={{ flex: 1 }}>
      {memoSegmentEdit}
      {memoSegmentAdd}
      <CardHeader
        title={<Typography variant="pageHeader">Сегменты</Typography>}
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
              <CustomAddButton
                // disabled={contractsIsFetching}
                // disabled
                label="Создать сегмент"
                onClick={() => setUpsertSegment({ addSegment: true })}
              />
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
