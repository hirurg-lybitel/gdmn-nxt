import styles from './send-message.module.less';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Autocomplete, Box, Button, CardActions, Checkbox, Chip, Divider, FormControlLabel, Stack, Tab, TextField } from '@mui/material';
import { ChangeEvent, useCallback, useState } from 'react';
import SendIcon from '@mui/icons-material/Send';
import InfoIcon from '@mui/icons-material/Info';
import CustomizedCard from '../../../components/Styled/customized-card/customized-card';
import ReactMarkdown from 'react-markdown';

/* eslint-disable-next-line */
export interface SendMessageProps {}

export function SendMessage(props: SendMessageProps) {
  const [tabIndex, setTabIndex] = useState('1');
  const [message, setMessage] = useState('');

  const handleTabsChange = useCallback((e, newindex: string) => {
    setTabIndex(newindex);
  }, []);

  const handleTextOnChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    // console.log('handleTextOnChange', e.target.value);
    setMessage(e?.target?.value || '');
  };


  return (
    <CustomizedCard borders boxShadows className={styles['item-card']}>
      <Stack spacing={2} flex={1}>
        <Stack direction="row">
          <FormControlLabel
            label="Все пользователи"
            control={<Checkbox />}
            style={{
              minWidth: '190px',
            }}
          />
          <Autocomplete
            options={[]}
            fullWidth
            renderInput={(params) => (
              <TextField
                {...params}
                label="Получатели"
                placeholder="Выберите получателей"
              />
            )}
          />
        </Stack>
        <TabContext value={tabIndex}>
          <Box>
            <TabList onChange={handleTabsChange}>
              <Tab label="Сообщение" value="1" />
              <Tab label="Предпросмотр" value="2" />
            </TabList>
          </Box>
          <Divider style={{ margin: 0 }} />
          <TabPanel value="1" className={styles['tab-panel']} aria-label="myLabel">
            <TextField
              multiline
              rows={4}
              autoFocus
              fullWidth
              value={message}
              onChange={handleTextOnChange}
            />
          </TabPanel>
          <TabPanel value="2" className={styles['tab-panel']}>
            <div>
              <ReactMarkdown>
                {message}

              </ReactMarkdown>
            </div>
            {/* <TextField
              multiline
              rows={4}
              autoFocus
              fullWidth
              variant='standard'
              value={message}
            /> */}
          </TabPanel>
        </TabContext>
      </Stack>
      <CardActions className={styles.actions}>
        <a href="https://www.markdownguide.org/basic-syntax/" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
          <Chip icon={<InfoIcon />} label="Поддерживаются стили Markdown " variant="outlined" style={{ border: 'none', cursor: 'pointer' }} />
        </a>
        <Box flex={1} />
        <Button variant="contained" startIcon={<SendIcon />}>Отправить</Button>
      </CardActions>


    </CustomizedCard>

  );
}

export default SendMessage;
