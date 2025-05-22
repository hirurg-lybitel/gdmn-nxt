import styles from './send-message.module.less';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Autocomplete, Box, Button, CardActions, CardContent, Checkbox, Chip, Divider, FormControlLabel, IconButton, Stack, Tab, TextField, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import { ChangeEvent, Fragment, useCallback, useEffect, useState } from 'react';
import SendIcon from '@mui/icons-material/Send';
import InfoIcon from '@mui/icons-material/Info';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CustomizedCard from '../../../components/Styled/customized-card/customized-card';
import ReactMarkdown from 'react-markdown';
import { useGetUsersQuery } from '../../../features/systemUsers';
import { IUser } from '@gsbelarus/util-api-types';
import { ClientToServerEvents, ServerToClientEvents, getSocketClient } from '@gdmn-nxt/socket';
import CloseIcon from '@mui/icons-material/Close';
import { SnackbarKey, useSnackbar } from 'notistack';
import { Socket } from 'socket.io-client';
import CustomizedScrollBox from '../../../components/Styled/customized-scroll-box/customized-scroll-box';
import { useAutocompleteVirtualization } from '@gdmn-nxt/helpers/hooks/useAutocompleteVirtualization';

/* eslint-disable-next-line */
export interface SendMessageProps {}

export function SendMessage(props: SendMessageProps) {
  const [tabIndex, setTabIndex] = useState('1');
  const [message, setMessage] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<IUser[]>([]);
  const [allUser, setAllUser] = useState<boolean>(false);
  const [socketClient, setSocketClient] = useState<Socket<ServerToClientEvents, ClientToServerEvents>>();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const { data: users = [], isFetching: usersIsFetching } = useGetUsersQuery();

  const handleTabsChange = useCallback((e: any, newindex: string) => {
    setTabIndex(newindex);
  }, []);

  const handleUsersChange = useCallback((e: ChangeEvent<HTMLSelectElement | any>, value: readonly IUser[]) => {
    e.target.classList.remove('Mui-focused');
    setSelectedUsers([...value]);
  }, []);

  const handleTextOnChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e?.target?.value || '');
  }, []);

  const handleCloseAlert = useCallback((snackbarId: SnackbarKey) => () => closeSnackbar(snackbarId), []);

  useEffect(() => {
    const socket = getSocketClient('notifications');
    setSocketClient(socket);
  }, []);

  const handleSend = useCallback(() => {
    socketClient?.emit('sendMessageToUsers_request', message, allUser ? users.map(u => u.ID) : selectedUsers.map(u => u.ID));
  }, [message, users, selectedUsers, allUser, socketClient]);


  const alertAction = (snackbarId: SnackbarKey) => (
    <Fragment>
      <IconButton
        size="small"
        color="inherit"
        onClick={handleCloseAlert(snackbarId)}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Fragment>
  );

  useEffect(() => {
    socketClient?.on('sendMessageToUsers_response', (status, statusText) => {
      if (status === 200) {
        setMessage('');
      };
      enqueueSnackbar(statusText, { variant: status === 200 ? 'success' : 'error', action: alertAction });
    });
  }, [socketClient]);

  const [ListboxComponent] = useAutocompleteVirtualization();

  const theme = useTheme();
  const matchDownSm = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <CustomizedCard
      boxShadows
      className={styles['item-card']}
      sx={{ minHeight: 'fit-content' }}
    >
      <CardContent
        style={{
          padding: 0
        }}
      >
        <Stack
          spacing={2}
          height="100%"
        >
          <Stack direction={{ xs: 'column-reverse', sm: 'row' }} sx={{ gap: { xs: '10px', sm: 0 } }}>
            <FormControlLabel
              label="Все пользователи"
              control={<Checkbox checked={allUser} onChange={(e, checked) => setAllUser(checked)} />}
              style={{
                minWidth: '190px',
              }}
            />
            <Autocomplete
              ListboxComponent={ListboxComponent}
              options={users}
              multiple
              disableCloseOnSelect
              fullWidth
              loading={usersIsFetching}
              loadingText="Загрузка данных..."
              getOptionLabel={option => option.NAME}
              value={
                users?.filter(u => selectedUsers?.find(el => el.ID === u.ID))
              }
              onChange={handleUsersChange}
              renderInput={(params) => {
                const { InputProps, ...paramsRest } = params;
                const { startAdornment, ...InputPropsRest } = InputProps;

                return (
                  <TextField
                    {
                      ...{
                        ...paramsRest,
                        InputProps: InputPropsRest
                      }}
                    label={selectedUsers?.length === 0 || params.inputProps['aria-expanded'] ? 'Получатели' : `Выбрано: ${selectedUsers?.length}`}
                    placeholder={selectedUsers?.length === 0 ? 'Выберите получателей' : `Выбрано: ${selectedUsers?.length}`}
                  />);
              }}
              renderOption={(props, option, { selected }) => (
                <li {...props} key={option.ID}>
                  <Checkbox
                    icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                    checkedIcon={<CheckBoxIcon fontSize="small" />}
                    checked={selected}
                  />
                  {option.NAME}
                </li>
              )}
            />
          </Stack>
          <TabContext
            value={tabIndex}
          >
            <Box>
              <TabList
                variant="scrollable"
                scrollButtons={false}
                onChange={handleTabsChange}
              >
                <Tab label="Сообщение" value="1" />
                <Tab label="Предпросмотр" value="2" />
              </TabList>
            </Box>
            <Divider style={{ margin: 0 }} />
            <TabPanel value="1" className={styles['tab-panel']}>
              <TextField
                className={styles.inputTextField}
                multiline
                rows={1}
                autoFocus
                fullWidth
                value={message}
                onChange={handleTextOnChange}
              />
            </TabPanel>
            <TabPanel value="2" className={styles['tab-panel']}>
              <div className={styles.preview}>
                <CustomizedScrollBox>
                  <ReactMarkdown>
                    {message}
                  </ReactMarkdown>
                </CustomizedScrollBox>
              </div>
            </TabPanel>
          </TabContext>
        </Stack>
      </CardContent>
      <CardActions className={styles.actions}>
        <Tooltip title={matchDownSm ? 'Поддерживаются стили Markdown' : ''}>
          <a
            href="https://www.markdownguide.org/basic-syntax/"
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: 'none' }}
          >
            <Chip
              icon={<InfoIcon />}
              label={matchDownSm ? '' : 'Поддерживаются стили Markdown'}
              variant="outlined"
              className={styles.info}
              style={{ border: 'none', cursor: 'pointer' }}
            />
          </a>
        </Tooltip>
        <Box flex={1} />
        <Button
          variant="contained"
          startIcon={<SendIcon />}
          onClick={handleSend}
          disabled={!(!!message && ((!allUser && selectedUsers?.length !== 0) || (allUser && users?.length !== 0)))}
        >
          Отправить
        </Button>
      </CardActions>
    </CustomizedCard>

  );
}

export default SendMessage;
