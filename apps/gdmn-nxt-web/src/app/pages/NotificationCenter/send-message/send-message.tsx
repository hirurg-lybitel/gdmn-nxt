import styles from './send-message.module.less';
import { Autocomplete, Box, Button, CardActions, CardContent, Checkbox, FormControlLabel, IconButton, Stack, TextField, useTheme } from '@mui/material';
import { ChangeEvent, Fragment, useCallback, useEffect, useState } from 'react';
import SendIcon from '@mui/icons-material/Send';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CustomizedCard from '../../../components/Styled/customized-card/customized-card';
import { useGetUsersQuery } from '../../../features/systemUsers';
import { IUser } from '@gsbelarus/util-api-types';
import { ClientToServerEvents, ServerToClientEvents, getSocketClient } from '@gdmn-nxt/socket';
import CloseIcon from '@mui/icons-material/Close';
import { SnackbarKey, useSnackbar } from 'notistack';
import { Socket } from 'socket.io-client';
import { useAutocompleteVirtualization } from '@gdmn-nxt/helpers/hooks/useAutocompleteVirtualization';
import MarkdownTextfield from '@gdmn-nxt/components/Styled/markdown-text-field/markdown-text-field';

/* eslint-disable-next-line */
export interface SendMessageProps { }

export function SendMessage(props: SendMessageProps) {
  const [message, setMessage] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<IUser[]>([]);
  const [allUser, setAllUser] = useState<boolean>(false);
  const [socketClient, setSocketClient] = useState<Socket<ServerToClientEvents, ClientToServerEvents>>();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const { data: users = [], isFetching: usersIsFetching } = useGetUsersQuery();

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
                    {...{
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
          <MarkdownTextfield
            sx={{ minHeight: '200px' }}
            required
            value={message}
            onChange={handleTextOnChange}
            fullHeight
            smallHintBreakpoint={'xl'}
            rows={1}
          />
        </Stack>
      </CardContent>
      <CardActions className={styles.actions}>
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
