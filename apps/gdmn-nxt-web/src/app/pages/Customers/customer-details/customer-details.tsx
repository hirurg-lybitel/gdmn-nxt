import CustomizedCard from '../../../components/customized-card/customized-card';
import './customer-details.module.less';
import { Box, Button, Divider, Stack, Tab } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ActCompletion from '../../../customers/CustomerDetails/act-completion/act-completion';
import { makeStyles } from '@mui/styles';

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
  }
}));

/* eslint-disable-next-line */
export interface CustomerDetailsProps {}

export function CustomerDetails(props: CustomerDetailsProps) {
  const classes = useStyles();

  const [tabIndex, setTabIndex] = useState('1');

  const { id: customerId } = useParams();


  const handleTabsChange = (event: any, newindex: string) => {
    setTabIndex(newindex);
  };

  const navigate = useNavigate();

  return (
    <Stack
      flex={1}
      spacing={2}
    >
      <CustomizedCard borders boxShadows style={{ padding: '8px' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
        >Клиенты</Button>
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
                <Tab label="Подробности" value="1" />
                <Tab label="Акты выполненных работ" value="2" />
                <Tab label="Выписки по р/с" value="3" />
              </TabList>
            </Box>
            <Divider />
            <TabPanel value="1" className={tabIndex === '1' ? classes.tabPanel : ''} >
              <div>Item One</div>
              <div>subitem one</div>
            </TabPanel>
            <TabPanel value="2" className={tabIndex === '2' ? classes.tabPanel : ''}>Item Two</TabPanel>
            <TabPanel value="3" className={tabIndex === '3' ? classes.tabPanel : ''} >
              <ActCompletion customerId={Number(customerId)} />
            </TabPanel>
          </TabContext>
        </Stack>
      </CustomizedCard>
    </Stack>
  );
};

export default CustomerDetails;

