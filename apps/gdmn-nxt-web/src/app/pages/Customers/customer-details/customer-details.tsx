import CustomizedCard from '../../../components/Styled/customized-card/customized-card';
import './customer-details.module.less';
import { Box, Breadcrumbs, Button, Divider, Link, Stack, Tab, Typography } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ActCompletion from '../../../customers/CustomerDetails/act-completion/act-completion';
import { makeStyles } from '@mui/styles';
import BankStatement from '../../../customers/CustomerDetails/bank-statement/bank-statement';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import { useGetCustomerQuery, useGetCustomersQuery } from '../../../features/customer/customerApi_new';
import ContractsList from '../../../customers/CustomerDetails/contracts-list/contracts-list';
import CustomerInfo from '../../../customers/CustomerDetails/customer-info/customer-info';
import { ICustomer } from '@gsbelarus/util-api-types';

const useStyles = makeStyles(() => ({
  card: {
    flex: 1,
    display: 'flex'
  },
  tabsBox: {
    borderBottom: 10,
    borderColor: 'red'
  },
  tabPanel: {
    flex: 1,
    display: 'flex'
  },
  link: {
    display: 'flex',
    alignItems: 'center'
  }
}));

/* eslint-disable-next-line */
export interface CustomerDetailsProps {}

export function CustomerDetails(props: CustomerDetailsProps) {
  const classes = useStyles();

  const [tabIndex, setTabIndex] = useState('1');

  const { id: customerId } = useParams();

  // const { data } = useGetCustomersQuery();
  const { data: customer } = useGetCustomerQuery({ customerId: Number(customerId) });
  // const customers: ICustomer[] = useMemo(() => [...data?.data || []], [data?.data]);

  const handleTabsChange = (event: any, newindex: string) => {
    setTabIndex(newindex);
  };

  const navigate = useNavigate();

  return (
    <Stack
      flex={1}
      spacing={2}
    >
      <CustomizedCard borders boxShadows style={{ padding: '18px' }}>
        <Breadcrumbs separator={<NavigateNextIcon />} >
          <Link className={classes.link} underline="none" key="1" color="inherit" href="/">
            <HomeIcon fontSize="small"/>
          </Link>,
          <Link
            className={classes.link}
            component="button"
            underline="none"
            key="2"
            onClick={() => navigate(-1)}
            variant="h1"
          >
            Клиенты
          </Link>
          <Typography key="3" color="text.primary" variant="h1">
            {customer?.NAME || '<Наменование>'}
          </Typography>
        </Breadcrumbs>
      </CustomizedCard>
      <CustomizedCard
        borders
        className={classes.card}
      >
        <Stack
          direction="column"
          flex={1}
          display="flex"
        >
          <TabContext value={tabIndex}>
            <Box className={classes.tabsBox}>
              <TabList onChange={handleTabsChange}>
                <Tab label="Реквизиты" value="1" />
                <Tab label="Акты выполненных работ" value="2" />
                <Tab label="Выписки по р/с" value="3" />
                <Tab label="Договоры" value="4" />
              </TabList>
            </Box>
            <Divider />
            <TabPanel value="1" className={tabIndex === '1' ? classes.tabPanel : ''} >
              <CustomerInfo customerId={Number(customerId)} />
            </TabPanel>
            <TabPanel value="2" className={tabIndex === '2' ? classes.tabPanel : ''}>
              <ActCompletion customerId={Number(customerId)} />
            </TabPanel>
            <TabPanel value="3" className={tabIndex === '3' ? classes.tabPanel : ''} >
              <BankStatement companyId={Number(customerId)} />
            </TabPanel>
            <TabPanel value="4" className={tabIndex === '4' ? classes.tabPanel : ''} >
              <ContractsList companyId={Number(customerId)} />
            </TabPanel>
          </TabContext>
        </Stack>
      </CustomizedCard>
    </Stack>
  );
};

export default CustomerDetails;

