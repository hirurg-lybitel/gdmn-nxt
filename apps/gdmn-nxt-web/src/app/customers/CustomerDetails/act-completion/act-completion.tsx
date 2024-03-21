import { Stack } from '@mui/material';
import CustomizedCard from '../../../components/Styled/customized-card/customized-card';
import { useGetActCompletionQuery } from '../../../features/act-completion/actCompletionApi';
import RefreshIcon from '@mui/icons-material/Refresh';
import StyledGrid from '../../../components/Styled/styled-grid/styled-grid';
import { ContractType } from '@gsbelarus/util-api-types';
import { columns } from './columns';
import useSystemSettings from '@gdmn-nxt/components/helpers/hooks/useSystemSettings';

export interface ActCompletionProps {
  customerId?: number;
};

export function ActCompletion(props: ActCompletionProps) {
  const { customerId } = props;

  const { data: actCompletion = [], refetch, isFetching: actCompletionIsFetching } = useGetActCompletionQuery(customerId);

  const systemSettings = useSystemSettings();

  const cols = columns[systemSettings?.CONTRACTTYPE ?? ContractType.GS];

  return (
    <Stack
      direction="column"
      flex="1"
      display="flex"
      spacing={1}
    >
      {/* <Box>
        <Button
          onClick={refetch}
          disabled={actCompletionIsFetching}
          startIcon={<RefreshIcon/>}
        >Обновить</Button>
      </Box> */}
      <CustomizedCard
        borders
        style={{
          flex: 1,
        }}
      >
        <StyledGrid
          rows={actCompletion}
          columns={cols}
          loading={actCompletionIsFetching}
          loadingMode="circular"
          pagination
          pageSizeOptions={[20]}
          paginationModel={{ page: 0, pageSize: 20 }}
          rowHeight={100}
        />
      </CustomizedCard>
    </Stack>
  );
}

export default ActCompletion;
