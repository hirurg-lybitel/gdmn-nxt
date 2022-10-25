import { IContactWithID, ICustomer, ICustomerContract, ILabel, IWorkType } from '@gsbelarus/util-api-types';
import { Box, Grid, List, ListItem, ListItemAvatar, ListItemText, Stack, TextField, Typography } from '@mui/material';
import LabelMarker from '../../../components/Labels/label-marker/label-marker';
import { useGetCustomerQuery, useGetCustomersCrossQuery } from '../../../features/customer/customerApi_new';
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';
import styles from './customer-info.module.less';
import { useGetWorkTypesQuery } from '../../../features/work-types/workTypesApi';
import { useGetDepartmentsQuery } from '../../../features/departments/departmentsApi';
import { useGetCustomerContractsQuery } from '../../../features/customer-contracts/customerContractsApi';
import { useMemo } from 'react';

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
    const ID  = customerData?.ID || -1;

    const DEPARTMENTS: IContactWithID[] = [];
    customersCross?.departments[ID]?.forEach((el:number) => {
      const department = departments?.find(wt => wt.ID === el);
      if (!department) return;
      DEPARTMENTS.push(department);
    });

    const JOBWORKS: IWorkType[] = [];
    customersCross?.jobWorks[ID]?.forEach((el:number) => {
      const wotkType = wotkTypes?.find(wt => wt.ID === el);
      if (!wotkType) return;
      JOBWORKS.push(wotkType);
    });

    const CONTRACTS: ICustomerContract[] = [];
    customersCross?.contracts[ID]?.forEach((el:number) => {
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
  }, [customerLoading])


  const columns = [
    {
      field: 'NAME',
      title: 'Название',
      renderFn: (value: any) => value
    },
    {
      field: 'FULLNAME',
      title: 'Полное название',
      renderFn: (value: any) => value
    },
    {
      field: 'TAXID',
      title: 'УНП',
      renderFn: (value: any) => value
    },
    {
      field: 'ADDRESS',
      title: 'Адрес юр.',
      renderFn: (value: any) => value
    },
    {
      field: 'POSTADDRESS',
      title: 'Адрес почт.',
      renderFn: (value: any) => value
    },
    {
      field: 'EMAIL',
      title: 'Email',
      renderFn: (value: any) => value
    },
    {
      field: 'PHONE',
      title: 'Тел.',
      renderFn: (value: any) => value
    },
    {
      field: 'FAX',
      title: 'Факс',
      renderFn: (value: any) => value
    },
    {
      field: 'DEPARTMENTS',
      title: 'Отделы',
      renderFn: (value: IContactWithID[]) => value?.map(({ NAME }) => NAME).join(", ") || ''
    },
    {
      field: 'CONTRACTS',
      title: 'Заказы',
      renderFn: (value: ICustomerContract[]) => value?.map(({ USR$NUMBER}) => USR$NUMBER).join(", ") || ''
    },
    {
      field: 'JOBWORKS',
      title: 'Виды работ',
      renderFn: (value: IWorkType[]) => value?.map(({ USR$NAME }) => USR$NAME).join(", ") || ''
    },

    // {
    //   field: 'EMPLOYEES',
    //   title: 'Сотрудники',
    //   renderFn: (value: any) => value
    // },
    // {
    //   field: 'LABELS',
    //   title: 'Метки',
    //   renderFn: (value: any) => value?.map((label: ILabel, idx: number) => <LabelMarker label={label} key={idx} />) || null
    // },
  ];

  return (
    <Box flex={1}>
      <PerfectScrollbar style={{ height: 'Calc(100vh - 262px)', flex: 1, padding: 24 }} >
        <List>
          {((row: any[]) => {
            for (const [key, value] of Object.entries(customer || {})) {
              columns.forEach((col, idx) => {
                if (col.field === key) {
                  row.push(
                    <ListItem key={idx} divider sx={{ py: 2 }}>
                      <Grid container>
                        <Grid item minWidth={200}>
                          <Typography variant="h4">{col.title}</Typography>
                        </Grid>
                        <Grid item flex={1}>
                          <Typography>{col.renderFn((value as any))}</Typography>
                        </Grid>
                        {/* <Grid item xl={3} lg={5} sm={5} md ={6} xs={6}>
                          <Typography variant="h4">{col.title}</Typography>
                        </Grid>
                        <Grid item xl={9} lg={7} sm={7} md={6} xs={6}>
                          <Typography>{col.renderFn(value)}</Typography>
                        </Grid> */}
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
      </PerfectScrollbar>
    </Box>
  );
}

export default CustomerInfo;
