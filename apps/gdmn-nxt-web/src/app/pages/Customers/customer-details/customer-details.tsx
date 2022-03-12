import CustomizedCard from '../../../components/customized-card/customized-card';
import './customer-details.module.less';
import { Box, Button, Stack, Tab } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/* eslint-disable-next-line */
export interface CustomerDetailsProps {}

export function CustomerDetails(props: CustomerDetailsProps) {
  const [tabIndex, setTabIndex] = useState('1');

  const handleTabsChange = (e: any, newindex: string) => {
    setTabIndex(newindex);
  };

  const navigate = useNavigate ();

  return (
    <Stack flex={1} spacing={2}>
      <CustomizedCard borders boxShadows style={{ padding: '8px' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
        >Клиенты</Button>
      </CustomizedCard>
      <CustomizedCard
        borders
      >
        <Box sx={{}}>
          <TabContext value={tabIndex}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <TabList onChange={handleTabsChange}>
                <Tab label="Подробности" value="1" />
                <Tab label="Акты выполненных работ" value="2" />
                <Tab label="Выписки по р/с" value="3" />
              </TabList>
            </Box>
            <TabPanel value="1">
              <div>Item One</div>
              <div>subitem one</div>
            </TabPanel>
            <TabPanel value="2">Item Two</TabPanel>
            <TabPanel value="3">Item Three</TabPanel>
          </TabContext>
        </Box>
      </CustomizedCard>
    </Stack>
  );
}


/* <Stack direction="column">
<CustomizedCard
  borders
  boxShadows
>
  <Accordion disableGutters expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
    <AccordionSummary
      //expandIcon={<ExpandMoreIcon />}
      aria-controls="panel1bh-content"
      id="panel1bh-header"
    >
      <Typography sx={{ width: '33%', flexShrink: 0 }}>
        Акты выполненных работ
      </Typography>
      <Typography sx={{ color: 'text.secondary' }}>I am an accordion</Typography>
    </AccordionSummary>
    <AccordionDetails>
      <Typography>
        Nulla facilisi. Phasellus sollicitudin nulla et quam mattis feugiat.
        Aliquam eget maximus est, id dignissim quam.
      </Typography>
    </AccordionDetails>
  </Accordion>
  <Accordion disableGutters expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
    <AccordionSummary
      //expandIcon={<ExpandMoreIcon />}
      aria-controls="panel1bh-content"
      id="panel1bh-header"
    >
      <Typography sx={{ width: '33%', flexShrink: 0 }}>
        Выписки по р/c
      </Typography>
      <Typography sx={{ color: 'text.secondary' }}>I am an accordion</Typography>
    </AccordionSummary>
    <AccordionDetails>
      <Typography>
        Nulla facilisi. Phasellus sollicitudin nulla et quam mattis feugiat.
        Aliquam eget maximus est, id dignissim quam.
      </Typography>
    </AccordionDetails>
  </Accordion>
</CustomizedCard>
</Stack> */
export default CustomerDetails;

