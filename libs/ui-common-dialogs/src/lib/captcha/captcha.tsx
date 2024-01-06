import { Box, Button, Dialog, Stack, TextField } from '@mui/material';
import { KeyboardEvent, useRef, useState } from 'react';
import styles from './captcha.module.less';

interface CaptchaProps {
  image: string;
  onCancel?: () => void;
  onSubmit: (value: string) => Promise<boolean>;
}

export function Captcha({ image = '', onSubmit, onCancel }: CaptchaProps) {
  const codeRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!codeRef.current) return;

    const result = await onSubmit(codeRef.current.value);
    if (!result) {
      return setError('Неверный код');
    }
    setError('');
  };

  const keyPress = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleClose = () => {
    onCancel && onCancel();
    setError('');
  };

  return (
    <Dialog
      open={!!image}
      onClose={handleClose}
      disableRestoreFocus
    >
      <Stack className={styles.container} spacing={1.5}>
        <div className={styles.captchaContainer} dangerouslySetInnerHTML={{ __html: image }} />
        <Stack direction="row" spacing={1.5}>
          <TextField
            autoFocus
            placeholder="Введите символы"
            inputRef={codeRef}
            InputProps={{ style: { backgroundColor: 'white' } }}
            onKeyDown={keyPress}
            helperText={error}
            error={!!error}
          />
          <Box paddingTop={'4px'}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
            >
            Проверить
            </Button>
          </Box>
        </Stack>
      </Stack>
    </Dialog>);
};

export default Captcha;

