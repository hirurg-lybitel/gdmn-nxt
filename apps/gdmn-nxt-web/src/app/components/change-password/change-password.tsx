import { Alert, Box, Button, Dialog, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import VisibilityOnIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import * as yup from 'yup';
import { ErrorTooltip } from '../Styled/error-tooltip/error-tooltip';
import { passwordValidation } from '@gdmn-nxt/helpers/validators';

interface IData {
  password: string,
  repeatPassword: string;
}

interface IChangePasswordProps {
  onSubmit: (password: string, repeatPassword: string) => Promise<{ result: boolean, message?: string; }>;
}

export default function ChangePassword({ onSubmit }: Readonly<IChangePasswordProps>) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [repeatPasswordVisible, setRepeatPasswordVisible] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);
  const [error, setError] = useState<string>();
  const [data, setData] = useState<IData>({ password: '', repeatPassword: '' });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const schema = yup.object().shape({
    password: passwordValidation(),
    repeatPassword: passwordValidation().test(
      'must-match',
      'Пароли не совпадают',
      (value) => value === data.password
    )
  });

  useEffect(() => {
    if (!isSubmit) {
      return setErrors({});
    }
    const validate = async () => {
      try {
        await schema.validate(data, { abortEarly: false });
        return setErrors({});
      } catch (error) {
        if (error instanceof yup.ValidationError) {
          const errorMap = error.inner.reduce((acc, err) => {
            if (!err.path) return acc;
            acc[err.path] = err.message;
            return acc;
          }, {} as Record<string, string>);

          return setErrors(errorMap);
        }
        return setErrors({});
      }
    };
    validate();
  }, [JSON.stringify(data), isSubmit]);

  const handleSubmit = () => {
    setIsSubmit(true);
    const fun = async () => {
      const isValid = await schema.isValid(data);
      if (!isValid) return;
      setLaunching(true);
      const result = await onSubmit(data.password, data.repeatPassword);
      if (!result.result) {
        result.message && setError(result.message);
      }
      setLaunching(false);
    };
    fun();
  };

  return (
    <>
      <Dialog
        open={!!error}
        onClose={() => setError('')}
        PaperProps={{
          sx: {
            backgroundColor: 'transparent',
          }
        }}
      >
        <Alert
          severity="error"
          sx={{ alignItems: 'center' }}
        >
          <Typography variant="subtitle1">{error}</Typography>
        </Alert>
      </Dialog>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Stack
          direction="column"
          spacing={3}
          sx={{
            width: { xs: '100%', sm: 360 },
            maxWidth: '100%',
            padding: { xs: 2.5, sm: 4 },
            backgroundColor: 'background.paper',
            borderRadius: 2,
            boxShadow: (theme) => theme.shadows[3],
            transition: 'box-shadow 0.3s ease-in-out',
            '&:hover': {
              boxShadow: (theme) => theme.shadows[8]
            }
          }}
        >
          <Box textAlign="center">
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{
                color: 'primary.main',
                mb: 1,
                fontSize: { xs: '1.75rem', sm: '2rem' }
              }}
            >
              Смена пароля
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ opacity: 0.8 }}
            >
              Для входа необходимо сменить пароль
            </Typography>
          </Box>
          <ErrorTooltip title={errors.password ?? ''}>
            <TextField
              fullWidth
              label="Пароль"
              type={passwordVisible ? 'text' : 'password'}
              autoComplete="false"
              value={data.password}
              error={!!errors.password}
              onChange={(e) => setData({ ...data, password: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <VpnKeyIcon color="action" sx={{ opacity: 0.7 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      edge="end"
                      sx={{
                        opacity: 0.7,
                        '&:hover': { opacity: 1 }
                      }}
                    >
                      {passwordVisible ? <VisibilityOnIcon /> : <VisibilityOffIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </ErrorTooltip>
          <ErrorTooltip title={errors.repeatPassword ?? ''}>
            <TextField
              fullWidth
              label="Повторите пароль"
              type={repeatPasswordVisible ? 'text' : 'password'}
              autoComplete="false"
              value={data.repeatPassword}
              error={!!errors.repeatPassword}
              onChange={(e) => setData({ ...data, repeatPassword: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <VpnKeyIcon color="action" sx={{ opacity: 0.7 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setRepeatPasswordVisible(!repeatPasswordVisible)}
                      edge="end"
                      sx={{
                        opacity: 0.7,
                        '&:hover': { opacity: 1 }
                      }}
                    >
                      {repeatPasswordVisible ? <VisibilityOnIcon /> : <VisibilityOffIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </ErrorTooltip>
          <Button
            variant="contained"
            size="large"
            sx={{
              py: 1.25,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              boxShadow: 'none',
              transition: 'all 0.2s ease-in-out',
              width: '100%'
            }}
            disabled={launching}
            onClick={handleSubmit}
          >
            {launching ? 'Входим...' : 'Войти'}
          </Button>
        </Stack>
      </div>
    </>
  );
}
