import { Box, Button, Stack, Theme } from '@mui/material';
import CustomizedCard from '../../../components/Styled/customized-card/customized-card';
import { useGetContractsListQuery } from '../../../features/contracts-list/contractsListApi';
import styles from './contracts-list.module.less';
import RefreshIcon from '@mui/icons-material/Refresh';
import { makeStyles } from '@mui/styles';
import { ColorMode, ContractType } from '@gsbelarus/util-api-types';
import StyledGrid from '../../../components/Styled/styled-grid/styled-grid';
import { columns } from './columns';
import useUserData from '@gdmn-nxt/components/helpers/hooks/useUserData';
import useSystemSettings from '@gdmn-nxt/components/helpers/hooks/useSystemSettings';

const useStyles = makeStyles((theme: Theme) => ({
  dataGrid: {
    '& .isActive--false': {
      backgroundColor: theme.palette.mode === ColorMode.Dark ? theme.color.red[400] : theme.color.red[100]
    }
  },
}));

export interface ContractsListProps {
  companyId?: number;
}

export function ContractsList(props: ContractsListProps) {
  const { companyId = -1 } = props;
  const classes = useStyles();
  const { data: contracts, isFetching: contractsIsFetching } = useGetContractsListQuery({ filter: { companyId } });

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
          disabled={contractsIsFetching}
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
          className={classes.dataGrid}
          getRowClassName={({ row }) => `isActive--${row.ISACTIVE}`}
          rows={contracts?.records || []}
          columns={cols}
          loading={contractsIsFetching}
          loadingMode="circular"
          pagination
          rowsPerPageOptions={[20]}
          pageSize={20}
        />
      </CustomizedCard>
    </Stack>
  );
}

export default ContractsList;
