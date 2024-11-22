import SystemSecurityUpdateGoodIcon from '@mui/icons-material/SystemSecurityUpdateGood';
import useUserData from '@gdmn-nxt/components/helpers/hooks/useUserData';
import { IAuthResult, IProfileSettings, ISession, IUserProfile } from '@gsbelarus/util-api-types';
import { Accordion, AccordionDetails, AccordionSummary, Box, Dialog, Divider, FormControlLabel, Grid, Icon, IconButton, Skeleton, Stack, Switch, Tooltip, Typography, useTheme } from '@mui/material';
import { useGetProfileSettingsQuery } from 'apps/gdmn-nxt-web/src/app/features/profileSettings';
import { Form, FormikProvider, useFormik } from 'formik';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useCreate2faMutation, useDisableOtpMutation, useGetCreate2faQuery } from 'apps/gdmn-nxt-web/src/app/features/auth/authApi';
import { useDispatch } from 'react-redux';
import { setError } from 'apps/gdmn-nxt-web/src/app/features/error-slice/error-slice';
import { CheckCode, CreateCode } from '@gsbelarus/ui-common-dialogs';
import StyledGrid from '@gdmn-nxt/components/Styled/styled-grid/styled-grid';
import { GridColDef, GridRowParams } from '@mui/x-data-grid-pro';
import PowerOffIcon from '@mui/icons-material/PowerOff';
import { useCloseSessionBySessionIdMutation, useGetActiveSessionsQuery } from 'apps/gdmn-nxt-web/src/app/features/security/securityApi';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Confirmation from '@gdmn-nxt/components/helpers/confirmation';
import dayjs from 'dayjs';

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
  const [activate2fa] = useCreate2faMutation();
  const [disableOtp] = useDisableOtpMutation();

  const dispatch = useDispatch();

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
        sx={{ maxWidth: '360px', margin: 3 }}
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


  const handleCloseSession = (id: string) => () => {
    if (!id) return;
    closeSession(id);
  };

  const reorderSessions = (sessions: ISession[]) => {
    const index = sessions.findIndex(item => item.current);
    if (index === -1) return sessions;
    const newMas = [...sessions];
    newMas.splice(index, 1);
    return [...[sessions[index]], ...newMas];
  };

  return (
    <FormikProvider value={formik}>
      <Form id="securityTabForm" onSubmit={formik.handleSubmit}>
        <Stack height={'100%'}>
          <Typography variant="subtitle1">Способы входа</Typography>
          <Stack direction="row" spacing={1}>
            <Icon fontSize="large" style={{ height: '100%', marginLeft: -7 }}>
              <SystemSecurityUpdateGoodIcon fontSize="large" color="action"/>
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
                  width: '155px'
                }}
                label={<Typography>{formik.values.ENABLED_2FA ? 'Подключено' : 'Отключено'}</Typography>}
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
          <Stack>
            <Accordion>
              <AccordionSummary
                // className={styles.accordionSummary}
                expandIcon={<ExpandMoreIcon />}
              >
                <Typography variant="subtitle1">Активные сессии</Typography>
              </AccordionSummary>
              {(sessionsIsLoading || sessionIsFetching) ?
                [1, 2, 3].map(value => {
                  return (
                    <AccordionDetails
                      key={value}
                      style={{
                        padding: 0,
                        paddingBottom: '1px',
                      }}
                    >
                      <Skeleton
                        variant="rectangular"
                        height={'38px'}
                        width={'100%'}
                      />
                    </AccordionDetails>
                  );
                })
                : reorderSessions(activeSessions).map(item => {
                  const date = dayjs(item.creationDate);
                  return (
                    <AccordionDetails
                      key={item.id}
                      style={{
                        padding: 0,
                        background: item.current ? 'rgba(33, 150, 243, 0.16)' : undefined
                      }}
                    >
                      <Grid
                        container
                        alignItems="center"
                        style={{ padding: '4px 0px' }}
                      >
                        <Grid
                          item
                          xs={5}
                          paddingLeft={2}
                          paddingRight={2}
                        >
                          <Typography variant="body2">{item.device}</Typography>
                        </Grid>
                        <Grid item flex={1}>
                          <Typography variant="body2">{item.location}</Typography>
                        </Grid>
                        <Grid item flex={1}>
                          <Typography variant="body2">
                            {date.format('DD.MM.YYYY HH:mm')}
                          </Typography>
                        </Grid>
                        <Grid
                          item
                          xs={2}
                          md={1}
                          marginRight={1.5}
                          textAlign={'right'}
                        >
                          <Confirmation
                            dangerous
                            onConfirm={handleCloseSession(item.id)}
                          >
                            <IconButton>
                              <PowerOffIcon color="error"/>
                            </IconButton>
                          </Confirmation>
                        </Grid>
                      </Grid>
                      <Divider/>
                    </AccordionDetails>
                  );
                })
              }
            </Accordion>
          </Stack>
        </Stack>
        {memoCheckCode}
        {memoCreateCode}
      </Form>
    </FormikProvider>
  );
}
