import { Alert, Box, Button, Dialog, Divider, InputAdornment, List, ListItem, ListItemIcon, Stack, TextField, Typography } from '@mui/material';
import SystemSecurityUpdateGoodIcon from '@mui/icons-material/SystemSecurityUpdateGood';
import styles from './create-code.module.less';
import { useRef, useState } from 'react';
import { IAuthResult, IUserProfile } from '@gsbelarus/util-api-types';
import axios from 'axios';

export interface CreateCodeProps {
  user?: IUserProfile;
  onSubmit: (code: string) => Promise<IAuthResult>;
  onCancel: () => void;
  onSignIn?: (email: string) => Promise<IAuthResult>;
};

const instruction = [
  'Установите Google Authenticator или Authy.',
  'В приложении аутентификации выберите значок «+».',
  'Выберите «Сканировать QR-код» и используйте камеру телефона,  чтобы отсканировать этот код.'
];

const subTitle = 'Для вашего пользователя двухфакторная аутентификация установлена как обязательна';

export function CreateCode({ user, onCancel, onSubmit, onSignIn }: CreateCodeProps) {
  const emailRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  const [email, setEmail] = useState<{
    userEmail?: string,
    isError?: boolean,
    errorMessage?: string
  }>({
    userEmail: user?.email,
    isError: false,
    errorMessage: ''
  });

  console.log('CreateCode', user);

  const handleEmailOk = () => {
    if (!emailRef.current) return;

    const value = emailRef.current.value;
    const regEx = new RegExp(/^[a-zа-я0-9\_\-\'\+]+([.]?[a-zа-я0-9\_\-\'\+])*@[a-zа-я0-9]+([.]?[a-zа-я0-9])*\.[a-zа-я]{2,}$/i);

    if (regEx.test(value)) {
      console.log('handleEmailOk', value);
      onSignIn && onSignIn(value);
      return setEmail(({ userEmail: value }));
    };

    const invalidChar = value.match(/[^a-zа-я\_\-\'\+ @.]/i);

    if (invalidChar) {
      return setEmail(({
        userEmail: value,
        isError: true,
        errorMessage: `Адрес не может содержать символ "${invalidChar}"` }));
    };

    setEmail(({
      userEmail: value,
      isError: true,
      errorMessage: 'Некорректный адрес' }));
  };

  const handleSubmit = async () => {
    if (!codeRef.current) return;
    const response = await onSubmit(codeRef.current.value);

    if (response.result === 'ERROR') {
      setError(response.message ?? '');
    }
  };

  const content =
    email.userEmail && !email.isError
      ? <>
        <Box textAlign="left">
          <Typography variant="subtitle1">Настройка Google Authenticator или Authy</Typography>
          <Divider style={{ margin: 0 }} />
          <List disablePadding dense>
            {instruction.map((el, idx) =>
              <ListItem
                key={`${idx}`}
                disableGutters
                alignItems="flex-start"
              >
                <ListItemIcon style={{ minWidth: 20, marginTop: 0 }}>
                  <Typography variant="body2">{idx + 1}</Typography>
                </ListItemIcon >
                <Typography variant="body2">{el}</Typography>
              </ListItem>)}
          </List>
        </Box>
        <Box>
          <Typography variant="subtitle1" textAlign="left">Просканируйте QR-код</Typography>
          <Divider style={{ margin: 0 }} />
          <div className={styles.qrContainer}>
            <img src={user?.qr} alt="Ошибка отображения QR кода" />
          </div>
        </Box>
        <Box textAlign="left">
          <Typography variant="subtitle1">Или введите код в своё приложение</Typography>
          <Divider style={{ margin: 0 }} />
          <div className={styles.secretContainer}>
            <Typography variant="body1">{user?.base32Secret ?? 'Ошибка отображения кода'}</Typography>
          </div>
        </Box>
        <Box textAlign="left">
          <Typography variant="subtitle1">Проверьте код</Typography>
          <Divider style={{ margin: 0 }} />
          <Typography variant="body1">Для применения настройки введите код аутентификации:</Typography>
        </Box>
        <TextField
          inputRef={codeRef}
          label="Код аутентификации"
          // sx={{ input: { color: 'black' } }}
          // value={userName}
          // error={authResult?.result === 'UNKNOWN_USER'}
          // helperText={authResult?.result === 'UNKNOWN_USER' ? authResult?.message : undefined}
          // disabled={waiting}
          // onChange={e => dispatch({ type: 'SET_USERNAME', userName: e.target.value })}
          // onKeyDown={keyPress}
          // inputProps={{ className: classes.input }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SystemSecurityUpdateGoodIcon />
              </InputAdornment>
            ),
          }}
        />
        <Divider />
        <Button variant="contained" onClick={handleSubmit}>Продолжить</Button>
        <Button onClick={onCancel}>Отмена</Button>
      </>
      : <>
        <Box textAlign="left">
          <Typography variant="subtitle1">Укажите свой email</Typography>
          <Divider />
          <Typography variant="body1">Для активации 2FA укажите свой email</Typography>
        </Box>
        <TextField
          label="Email"
          type="text"
          fullWidth
          inputRef={emailRef}
          error={email.isError}
          helperText={email.errorMessage}
          onFocus={() => setEmail(prev => ({ ...prev, errorMessage: '' }))}
        />
        <Divider />
        <Button variant="contained" onClick={handleEmailOk}>Продолжить</Button>
        <Button onClick={onCancel}>Отмена</Button>
      </>;


  return (
    <Stack spacing={2} textAlign="center">
      <Box textAlign="center">
        <Typography variant="pageHeader">Двухфакторная аутентификация (2FA)</Typography>
      </Box>
      <Typography variant="body1" hidden={!!user?.permissions}>{subTitle}</Typography>
      {content}
      <Dialog onClose={() => setError('')} open={!!error}>
        <Alert
          severity="error"
          variant="filled"
          style={{ alignItems: 'center' }}
        >
          <Typography variant="subtitle1">{error}</Typography>
        </Alert>
      </Dialog>
    </Stack>
  );
}

export default CreateCode;
