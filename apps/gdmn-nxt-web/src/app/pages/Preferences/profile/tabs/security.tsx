import SystemSecurityUpdateGoodIcon from '@mui/icons-material/SystemSecurityUpdateGood';
import useUserData from '@gdmn-nxt/helpers/hooks/useUserData';
import { IAuthResult, IChangePassword, IProfileSettings, IUserProfile, UserType } from '@gsbelarus/util-api-types';
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Dialog, FormControlLabel, Grid, Icon, IconButton, InputAdornment, Skeleton, Stack, Switch, TextField, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useGetProfileSettingsQuery } from 'apps/gdmn-nxt-web/src/app/features/profileSettings';
import { Form, FormikProvider, useFormik } from 'formik';
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useCreate2faMutation, useDisableOtpMutation, useGetCreate2faQuery } from 'apps/gdmn-nxt-web/src/app/features/auth/authApi';
import { useDispatch, useSelector } from 'react-redux';
import { clearError, setError } from 'apps/gdmn-nxt-web/src/app/features/error-slice/error-slice';
import { CheckCode, CreateCode } from '@gsbelarus/ui-common-dialogs';

import PowerOffIcon from '@mui/icons-material/PowerOff';
import { useCloseSessionBySessionIdMutation, useGetActiveSessionsQuery } from 'apps/gdmn-nxt-web/src/app/features/security/securityApi';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Confirmation from '@gdmn-nxt/helpers/confirmation';
import dayjs from 'dayjs';
import ComputerIcon from '@mui/icons-material/Computer';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import TabletIcon from '@mui/icons-material/Tablet';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { RootState } from '@gdmn-nxt/store';
import { passwordValidation } from '@gdmn-nxt/helpers/validators';
import * as yup from 'yup';
import { PasswordTextField } from '@gdmn-nxt/components/Styled/password-text-field/password-Text-field';
import { useChangePasswordMutation } from 'apps/gdmn-nxt-web/src/app/features/systemUsers';
import { useSnackbar } from '@gdmn-nxt/helpers/hooks/useSnackbar';

export default function SecurityTab() {
  const userProfile = useUserData();
  const { data: settings, isLoading } = useGetProfileSettingsQuery(userProfile?.id ?? -1);
  const { data: activeSessions = [], isFetching: sessionIsFetching, isLoading: sessionsIsLoading } = useGetActiveSessionsQuery(undefined, { pollingInterval: 1 * 60 * 1000 });
  const [closeSession] = useCloseSessionBySessionIdMutation();
  const [fetchDataCreate2fa, setFetchDataCreate2fa] = useState(false);
  const { data: dataCreate2fa } = useGetCreate2faQuery(undefined, {
    refetchOnMountOrArgChange: true,
    skip: !fetchDataCreate2fa
  });
  const ticketsUser = useSelector<RootState, boolean>(state => state.user.userProfile?.type === UserType.Tickets);
  const [activate2fa] = useCreate2faMutation();
  const [disableOtp] = useDisableOtpMutation();

  const dispatch = useDispatch();

  const theme = useTheme();
  const matchDownSm = useMediaQuery(theme.breakpoints.down('sm'));

  const initValue: Partial<IProfileSettings> = {
    ENABLED_2FA: settings?.ENABLED_2FA ?? false,
    REQUIRED_2FA: settings?.REQUIRED_2FA ?? false,
  };

  const formik = useFormik<IProfileSettings>({
    enableReinitialize: true,
    validateOnBlur: false,
    initialValues: {
      ...initValue,
      ...settings
    },
    onSubmit: (values) => {
      // if (!confirmOpen) {
      //   setConfirmOpen(true);
      //   return;
      // };
      // setConfirmOpen(false);
    },
  });

  const [user, setUser] = useState<IUserProfile>();
  const [twoFAOpen, setTwoFAOpen] = useState<{
    create?: boolean;
    check?: boolean;
  }>({
    create: false,
    check: false
  });

  useEffect(() => {
    if (dataCreate2fa?.result === 'SUCCESS') {
      setUser({
        ...userProfile,
        userName: userProfile?.userName ?? '',
        email: formik.values.EMAIL ?? '',
        qr: dataCreate2fa.userProfile?.qr,
        base32Secret: dataCreate2fa.userProfile?.base32Secret
      });
      setTwoFAOpen({ create: true });
      setFetchDataCreate2fa(false);
    }
    if (dataCreate2fa?.result === 'ERROR') {
      dispatch(setError({
        errorMessage: dataCreate2fa.message ?? '',
        errorStatus: 500
      }));
      setFetchDataCreate2fa(false);
    }
  }, [dataCreate2fa]);

  const handleCreateOnSubmit = async (authCode: string, emailCode: string): Promise<IAuthResult> => {
    const response = await activate2fa({ authCode, emailCode });

    if (!('data' in response)) return new Promise((resolve) => resolve({} as IAuthResult));

    if (response.data.result === 'SUCCESS') {
      formik.setFieldValue('ENABLED_2FA', true);
      formik.handleSubmit();
      setTwoFAOpen({ create: false });
    }

    return response.data;
  };

  const handleCheckOnSubmit = async (code: string): Promise<IAuthResult> => {
    const response = await disableOtp({ code });

    if (!('data' in response)) return new Promise((resolve) => resolve({} as IAuthResult));

    if (response.data.result === 'SUCCESS') {
      formik.setFieldValue('ENABLED_2FA', false);
      formik.handleSubmit();
      setTwoFAOpen({ check: false });
    }

    return response.data;
  };

  const handleEnable2FAWithNewEmail = async (email: string): Promise<IAuthResult> => {
    setFetchDataCreate2fa(true);
    return new Promise((resolve) => resolve({} as IAuthResult));
  };

  const onEnable2FAChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;

    if (checked) {
      if (!formik.values.EMAIL) {
        setTwoFAOpen({ create: true });
        return;
      }
      setFetchDataCreate2fa(true);
    }
    /** Если хотим отключить, то надо ввести текущий код */
    if (!checked) {
      setTwoFAOpen({ check: true });
    }
  };

  const memoCheckCode = useMemo(() =>
    <Dialog open={twoFAOpen.check ?? false} style={{ padding: 2 }}>
      <Stack
        direction="column"
        justifyContent="center"
        alignContent="center"
      >
        <CheckCode onCancel={() => setTwoFAOpen({ check: false })} onSubmit={handleCheckOnSubmit} />
      </Stack>
    </Dialog>, [twoFAOpen.check]);

  const memoCreateCode = useMemo(() =>
    <Dialog open={twoFAOpen.create ?? false} style={{ padding: 2 }}>
      <Stack
        direction="column"
        justifyContent="center"
        alignContent="center"
        sx={{ maxWidth: '440px', margin: '20px' }}
      >
        <CreateCode
          user={user}
          onCancel={() => setTwoFAOpen({ check: false })}
          onSubmit={handleCreateOnSubmit}
          onSignIn={handleEnable2FAWithNewEmail}
        />
      </Stack>
    </Dialog>, [twoFAOpen.create, user]);

  const handleCloseSession = useCallback((id: string) => () => {
    if (!id) return;
    closeSession(id);
  }, [closeSession]);

  const reorderSessions = useMemo(() => {
    const currentSession = activeSessions.find(item => item.current);
    if (!currentSession) return activeSessions;

    const otherSessions = activeSessions.filter(item => !item.current);
    return [currentSession, ...otherSessions];
  }, [activeSessions]);

  const getDeviceIcon = (device: string) => {
    const deviceLower = device.toLowerCase();
    if (deviceLower.includes('android') || deviceLower.includes('iphone')) return <SmartphoneIcon />;
    if (deviceLower.includes('ipad')) return <TabletIcon />;
    return <ComputerIcon />;
  };

  const [changePasswordData, setChangePasswordData] = useState<IChangePassword>({});

  const [error, setErrors] = useState<Record<string, string>>();
  const [isSubmit, setIsSubmit] = useState(false);
  const [launching, setLaunching] = useState(false);

  const schema = yup.object().shape({
    password: yup.string().required('Обязательное поле'),
    newPassword: passwordValidation().required('Обязательное поле'),
    repeatPassword: passwordValidation().test(
      'must-match',
      'Пароли не совпадают',
      (value) => value === changePasswordData.newPassword
    )
      .required('Обязательное поле')
  });

  useEffect(() => {
    if (!isSubmit) {
      return setErrors({});
    }
    const validate = async () => {
      try {
        await schema.validate(changePasswordData, { abortEarly: false });
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
  }, [JSON.stringify(changePasswordData), isSubmit, JSON.stringify(schema)]);

  const passwordFieldChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setChangePasswordData({ ...changePasswordData, [e.target.name]: e.target.value });
  }, [changePasswordData]);

  const [changePassword] = useChangePasswordMutation();

  const { addSnackbar } = useSnackbar();

  const onClose = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleChangePassword = () => {
    setIsSubmit(true);
    const fun = async () => {
      const isValid = await schema.isValid(changePasswordData);
      if (!isValid) return;
      setLaunching(true);
      const result = await changePassword(changePasswordData);
      if ('data' in result) {
        if (result.data.result === 'ERROR' && result.data.message) {
          addSnackbar(result.data.message, { variant: 'error', onClose });
        }
        if (result.data.result === 'SUCCESS') {
          addSnackbar('Пароль успешно изменен', { variant: 'success', onClose });
          setChangePasswordData({});
          setIsSubmit(false);
          setErrors({});
        }
      }
      setLaunching(false);
    };
    fun();
  };

  return (
    <FormikProvider value={formik}>
      <Form id="securityTabForm" onSubmit={formik.handleSubmit}>
        <Stack height={'100%'}>
          {!ticketsUser && <>
            <Typography variant="subtitle1">Способы входа</Typography>
            <Stack direction="row" spacing={1}>
              <Icon fontSize="large" style={{ height: '100%', marginLeft: -7 }}>
                <SystemSecurityUpdateGoodIcon fontSize="large" color="action" />
              </Icon>
              <Stack>
                <Typography >Двухфакторная аутентификация</Typography>
                <Typography variant="caption">Дополнительная защита аккаунта с паролем</Typography>
              </Stack>
              <Box flex={1} />
              <Tooltip
                style={{ cursor: 'help' }}
                arrow
                title={formik.values.REQUIRED_2FA ? 'Для вашего пользователя установлена обязательная двухфакторная аутентификация' : ''}
              >
                <FormControlLabel
                  style={{
                    width: matchDownSm ? undefined : '155px'
                  }}
                  label={matchDownSm ? undefined : <Typography>{formik.values.ENABLED_2FA ? 'Подключено' : 'Отключено'}</Typography>}
                  disabled={formik.values.REQUIRED_2FA}
                  control={
                    <Switch
                      name="ENABLED_2FA"
                      checked={formik.values.ENABLED_2FA}
                      onChange={onEnable2FAChange}
                    />}
                />
              </Tooltip>
            </Stack>
          </>}
          {ticketsUser && < Stack spacing={2} style={{ maxWidth: '300px' }}>
            <Typography variant="subtitle1">Смена пароля</Typography>
            <PasswordTextField
              disabled={launching}
              required
              name={'password'}
              onChange={passwordFieldChange}
              value={changePasswordData.password ?? ''}
              label={'Старый пароль'}
              error={!!error?.password}
              helperText={error?.password}
            />
            <PasswordTextField
              disabled={launching}
              name={'newPassword'}
              onChange={passwordFieldChange}
              value={changePasswordData.newPassword ?? ''}
              required
              label={'Новый пароль'}
              error={!!error?.newPassword}
              helperText={error?.newPassword}
            />
            <PasswordTextField
              disabled={launching}
              name={'repeatPassword'}
              onChange={passwordFieldChange}
              value={changePasswordData.repeatPassword ?? ''}
              required
              label={'Повторите новый пароль'}
              error={!!error?.repeatPassword}
              helperText={error?.repeatPassword}
            />
            <div>
              <Button
                disabled={launching}
                variant="contained"
                onClick={handleChangePassword}
              >
                Сохранить
              </Button>
            </div>
          </Stack>}
          <Stack spacing={2}>
            <Accordion defaultExpanded disableGutters>
              <AccordionSummary
                sx={{
                  paddingLeft: 0,
                  '& .MuiAccordionSummary-content': {
                    alignItems: 'center'
                  }
                }}
                expandIcon={<ExpandMoreIcon />}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Активные сессии ({activeSessions.length})
                </Typography>
              </AccordionSummary>
              {(sessionsIsLoading || sessionIsFetching) ?
                [1, 2, 3].map(value => (
                  <AccordionDetails
                    key={value}
                    sx={{
                      padding: 0,
                      paddingBottom: '1px',
                    }}
                  >
                    <Skeleton
                      variant="rectangular"
                      height={60}
                      width="100%"
                      sx={{ borderRadius: 1 }}
                    />
                  </AccordionDetails>
                ))
                : reorderSessions.map(item => {
                  const date = dayjs(item.creationDate);
                  return (
                    <AccordionDetails
                      key={item.id}
                      sx={{
                        padding: '12px 0',
                        background: item.current ? 'rgba(33, 150, 243, 0.08)' : undefined,
                        borderRadius: 1,
                        '&:hover': {
                          background: item.current ? 'rgba(33, 150, 243, 0.12)' : 'rgba(0, 0, 0, 0.04)'
                        }
                      }}
                    >
                      <Grid
                        container
                        alignItems="center"
                        sx={{ px: 2 }}
                        item
                      >
                        <Grid
                          container
                          item
                          alignItems="center"
                          xs={11.5}
                          md={11.3}
                          spacing={2}
                        >
                          <Grid
                            item
                            xs={12}
                            md={4}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              {getDeviceIcon(item.device?.os?.name ?? '')}
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: item.current ? 600 : 400 }}>
                                  {item.device?.os?.name ?? 'Не определено'}
                                  {item.current && (
                                    <Typography
                                      component="span"
                                      variant="caption"
                                      sx={{ ml: 1, color: 'primary.main' }}
                                    >
                                      (текущая сессия)
                                    </Typography>
                                  )}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {item.device?.browser?.name ?? 'Не определено'}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                          <Grid
                            item
                            xs={12}
                            md={4}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LocationOnIcon fontSize="small" color="action" />
                              <Typography variant="body2" color="text.secondary">
                                {item.location ? `${item.location.city}, ${item.location.country}` : 'Местоположение неизвестно'}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid
                            item
                            xs={12}
                            md={4}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <AccessTimeIcon fontSize="small" color="action" />
                              <Typography variant="body2" color="text.secondary">
                                {date.format('DD.MM.YYYY HH:mm')}
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                        <Grid
                          xs={0.5}
                          md={0.7}
                          sx={{ display: 'flex', justifyContent: 'flex-end' }}
                          item
                        >
                          {!item.current && (
                            <Confirmation
                              dangerous
                              onConfirm={handleCloseSession(item.id)}
                              title="Закрытие сессии"
                            >
                              <Tooltip title="Закрыть сессию">
                                <IconButton sx={{ color: 'error.main' }}>
                                  <PowerOffIcon />
                                </IconButton>
                              </Tooltip>
                            </Confirmation>
                          )}
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  );
                })
              }
            </Accordion>
          </Stack>
          {memoCheckCode}
          {memoCreateCode}
        </Stack>
      </Form>
    </FormikProvider >
  );
}
