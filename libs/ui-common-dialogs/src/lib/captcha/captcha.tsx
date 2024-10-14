import { Box, Button, Dialog, IconButton, Stack, TextField } from '@mui/material';
import { KeyboardEvent, useRef, useState } from 'react';
import styles from './captcha.module.less';
import ReplayIcon from '@mui/icons-material/Replay';

interface CaptchaProps {
  image: string;
  regenerate: () => Promise<void>;
  onCancel?: () => void;
  onSubmit: (value: string) => Promise<boolean>;
}

export function Captcha({ image = '', onSubmit, onCancel, regenerate }: CaptchaProps) {
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
        <div className={styles.captchaContainer}>
          <div className={styles.captcha} dangerouslySetInnerHTML={{ __html: image }} />
          <div className={styles.regenerateButton}>
            <IconButton onClick={regenerate}><ReplayIcon /></IconButton>
          </div>
        </div>
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

