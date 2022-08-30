import { ILabel } from '@gsbelarus/util-api-types';
import { Box, Grid, List, ListItem, ListItemAvatar, ListItemText, Stack, TextField, Typography } from '@mui/material';
import LabelMarker from '../../../components/Labels/label-marker/label-marker';
import { useGetCustomerQuery } from '../../../features/customer/customerApi_new';
import styles from './customer-info.module.less';

export interface CustomerInfoProps {
  customerId: number;
}

export function CustomerInfo(props: CustomerInfoProps) {
  const { customerId } = props;

  const { data: customer, isLoading: customerLoading } = useGetCustomerQuery({ customerId });

  const columns = [
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
      field: 'TAXID',
      title: 'УНП',
      renderFn: (value: any) => value
    },
    {
      field: 'ADDRESS',
      title: 'Адрес',
      renderFn: (value: any) => value
    },
    // {
    //   field: 'LABELS',
    //   title: 'Метки',
    //   renderFn: (value: any) => value?.map((label: ILabel, idx: number) => <LabelMarker label={label} key={idx} />) || null
    // },
  ];

  return (
    <Box flex={0.5} minWidth={400}>
      <List>

        {((row: any[]) => {
          for (const [key, value] of Object.entries(customer || {})) {
            columns.forEach((col, idx) => {
              if (col.field === key) {
                row.push(
                  <ListItem key={idx} divider sx={{ py: 2 }}>
                    <Grid container>
                      <Grid item xl={3} lg={5} sm={5} md ={6} xs={6}>
                        <Typography variant="h4">{col.title}</Typography>
                      </Grid>
                      <Grid item xl={9} lg={7} sm={7} md={6} xs={6}>
                        <Typography>{col.renderFn(value)}</Typography>
                      </Grid>
                    </Grid>
                  </ListItem>
                );
              }
            });
          }
          row.sort((a, b) => a.key > b.key ? 1 : -1);

          return row;
        })([])}
      </List>
    </Box>
  );
}

export default CustomerInfo;
