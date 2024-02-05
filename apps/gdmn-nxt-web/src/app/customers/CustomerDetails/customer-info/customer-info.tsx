import { IBusinessProcess, IContactWithID, ICustomerContract, IWorkType } from '@gsbelarus/util-api-types';
import { Box, Grid, List, ListItem, Typography } from '@mui/material';
import { useGetCustomerQuery, useGetCustomersCrossQuery } from '../../../features/customer/customerApi_new';
import styles from './customer-info.module.less';
import { useGetWorkTypesQuery } from '../../../features/work-types/workTypesApi';
import { useGetDepartmentsQuery } from '../../../features/departments/departmentsApi';
import { useGetCustomerContractsQuery } from '../../../features/customer-contracts/customerContractsApi';
import { useMemo } from 'react';
import CircularIndeterminate from '../../../components/helpers/circular-indeterminate/circular-indeterminate';
import CustomizedScrollBox from '@gdmn-nxt/components/Styled/customized-scroll-box/customized-scroll-box';


type Requisites = IBusinessProcess[] & IContactWithID[] & ICustomerContract[] & IWorkType[] & string;
export interface CustomerInfoProps {
  customerId: number;
}

export function CustomerInfo(props: CustomerInfoProps) {
  const { customerId } = props;

  const { data: customerData, isLoading: customerLoading } = useGetCustomerQuery({ customerId });

  const { data: customersCross } = useGetCustomersCrossQuery();
  const { data: wotkTypes } = useGetWorkTypesQuery();
  const { data: departments } = useGetDepartmentsQuery();
  const { data: customerContracts } = useGetCustomerContractsQuery();

  const customer = useMemo(() => {
    const ID = customerData?.ID || -1;

    const DEPARTMENTS: IContactWithID[] = [];
    customersCross?.departments[ID]?.forEach((el: number) => {
      const department = departments?.find(wt => wt.ID === el);
      if (!department) return;
      DEPARTMENTS.push(department);
    });

    const JOBWORKS: IWorkType[] = [];
    customersCross?.jobWorks[ID]?.forEach((el: number) => {
      const wotkType = wotkTypes?.find(wt => wt.ID === el);
      if (!wotkType) return;
      JOBWORKS.push(wotkType);
    });

    const CONTRACTS: ICustomerContract[] = [];
    customersCross?.contracts[ID]?.forEach((el: number) => {
      const customerContract = customerContracts?.find(wt => wt.ID === el);
      if (!customerContract) return;
      CONTRACTS.push(customerContract);
    });

    return {
      ...customerData,
      DEPARTMENTS,
      CONTRACTS,
      JOBWORKS
    };
  }, [customerLoading]);


  const columns = useMemo(() => [
    {
      field: 'NAME',
      title: 'Название',
      renderFn: (value: string) => value
    },
    {
      field: 'FULLNAME',
      title: 'Полное название',
      renderFn: (value: string) => value
    },
    {
      field: 'TAXID',
      title: 'УНП',
      renderFn: (value: string) => value
    },
    {
      field: 'ADDRESS',
      title: 'Адрес юр.',
      renderFn: (value: string) => value
    },
    {
      field: 'POSTADDRESS',
      title: 'Адрес почт.',
      renderFn: (value: string) => value
    },
    {
      field: 'EMAIL',
      title: 'Email',
      renderFn: (value: string) => value
    },
    {
      field: 'PHONE',
      title: 'Тел.',
      renderFn: (value: string) => value
    },
    {
      field: 'FAX',
      title: 'Факс',
      renderFn: (value: string) => value
    },
    {
      field: 'BUSINESSPROCESSES',
      title: 'Бизнес-процессы',
      renderFn: (value: IBusinessProcess[]) => value?.map(({ NAME }) => NAME).join('\n') || ''
    },
    {
      field: 'DEPARTMENTS',
      title: 'Отделы',
      renderFn: (value: IContactWithID[]) => value?.map(({ NAME }) => NAME).join(', ') || ''
    },
    {
      field: 'CONTRACTS',
      title: 'Заказы',
      renderFn: (value: ICustomerContract[]) => value?.map(({ USR$NUMBER }) => USR$NUMBER).join(', ') || ''
    },
    {
      field: 'JOBWORKS',
      title: 'Виды работ',
      renderFn: (value: IWorkType[]) => value?.map(({ USR$NAME }) => USR$NAME).join('\n') || ''
    },
  ], []);

  if (customerLoading) {
    return (
      <Box flex={1} display="flex">
        <CircularIndeterminate open={customerLoading} />
      </Box>
    );
  }

  return (
    <Box flex={1} height={'100%'}>
      <CustomizedScrollBox>
        <List>
          {((row: any[]) => {
            for (const [key, value] of Object.entries(customer || {})) {
              columns.forEach((col, idx) => {
                if (col.field === key) {
                  row.push(
                    <ListItem key={idx} divider>
                      <Grid container>
                        <Grid item minWidth={200}>
                          <Typography variant="subtitle1">{col.title}</Typography>
                        </Grid>
                        <Grid item flex={1}>
                          <Typography
                            style={{
                              whiteSpace: 'pre-wrap'
                            }}
                          >
                            {col.renderFn((value as Requisites))}
                          </Typography>
                        </Grid>
                      </Grid>
                    </ListItem>
                  );
                }
              });
            };
            row.sort((a, b) => +a.key > +b.key ? 1 : -1);

            return row;
          })([])}
        </List>
      </CustomizedScrollBox>
    </Box>
  );
}

export default CustomerInfo;
