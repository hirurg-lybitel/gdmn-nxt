import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import CustomAddButton from '@gdmn-nxt/components/helpers/custom-add-button';
import CustomLoadingButton from '@gdmn-nxt/components/helpers/custom-loading-button/custom-loading-button';
import { ITemplate } from '@gsbelarus/util-api-types';
import { Box, CardContent, CardHeader, Divider, Stack, Typography } from '@mui/material';

const mockData: ITemplate[] = [
  {
    ID: 1,
    HTML: ''
  },
  {
    ID: 2,
    HTML: ''
  },
  {
    ID: 3,
    HTML: ''
  },
  {
    ID: 4,
    HTML: ''
  },
  {
    ID: 5,
    HTML: ''
  },
  {
    ID: 6,
    HTML: ''
  },
];

export default function Templates() {
  return (
    <CustomizedCard style={{ flex: 1 }}>
      <CardHeader
        title={<Typography variant="pageHeader">Шаблоны</Typography>}
        action={
          <Stack direction="row" spacing={1}>
            <Box flex={1} />
            <Box display="inline-flex" alignSelf="center">
              <CustomAddButton
                // disabled={contractsIsFetching}
                // disabled
                label="Создать шаблон"
                // onClick={() => setUpsertSegment({ addSegment: true })}
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
        <div
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
          }}
        >
          <ul
            style={{
              display: 'grid',
              gridRowGap: '16px',
              gridColumnGap: '16px',
              padding: '0 24px',
              listStyle: 'none',
              gridTemplateColumns: 'repeat(5, 1fr)',
            }}
          >
            {mockData.map(({ ID, HTML }) =>
              <li
                key={ID}
              >
                <div
                  style={{
                    height: 100,
                    width: 200,
                    backgroundColor: 'gray'
                  }}
                >
                  {HTML}
                </div>
              </li>
            )}
          </ul>
        </div>
      </CardContent>
    </CustomizedCard>
  );
};
