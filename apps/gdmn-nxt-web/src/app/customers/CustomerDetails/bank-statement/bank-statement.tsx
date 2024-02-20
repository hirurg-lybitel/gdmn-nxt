import { Stack } from '@mui/material';
import CustomizedCard from '../../../components/Styled/customized-card/customized-card';
import { useGetBankStatementQuery } from '../../../features/bank-statement/bankStatementApi';
import RefreshIcon from '@mui/icons-material/Refresh';
import StyledGrid from '../../../components/Styled/styled-grid/styled-grid';
import { columns } from './columns';
import { ContractType } from '@gsbelarus/util-api-types';
import useSystemSettings from '@gdmn-nxt/components/helpers/hooks/useSystemSettings';

export interface BankStatementProps {
  companyId?: number;
};

export function BankStatement({
  companyId
}: BankStatementProps) {
  const { data: bankStatement = [], refetch, isFetching: bankStatementIsFetching } = useGetBankStatementQuery(companyId);

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
          disabled={bankStatementIsFetching}
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
          rows={bankStatement}
          columns={cols}
          loading={bankStatementIsFetching}
          loadingMode="circular"
          pagination
          rowsPerPageOptions={[20]}
          pageSize={20}
          rowHeight={100}
        />
      </CustomizedCard>
    </Stack>
  );
};

export default BankStatement;
