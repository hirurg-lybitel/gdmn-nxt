import SystemSecurityUpdateGoodIcon from '@mui/icons-material/SystemSecurityUpdateGood';
import useUserData from '@gdmn-nxt/components/helpers/hooks/useUserData';
import { IAuthResult, IProfileSettings, IUserProfile } from '@gsbelarus/util-api-types';
import { Box, Dialog, FormControlLabel, Icon, Stack, Switch, Tooltip, Typography } from '@mui/material';
import { useGetProfileSettingsQuery } from 'apps/gdmn-nxt-web/src/app/features/profileSettings';
import { Form, FormikProvider, useFormik } from 'formik';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useCreate2faMutation, useDisableOtpMutation, useGetCreate2faQuery } from 'apps/gdmn-nxt-web/src/app/features/auth/authApi';
import { useDispatch } from 'react-redux';
import { setError } from 'apps/gdmn-nxt-web/src/app/features/error-slice/error-slice';
import { CheckCode, CreateCode } from '@gsbelarus/ui-common-dialogs';

export default function SecurityTab() {
  const userProfile = useUserData();
  const { data: settings, isLoading } = useGetProfileSettingsQuery(userProfile?.id ?? -1);

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
        sx={{ maxWidth: '440px', margin: 3 }}
      >
        <CreateCode
          user={user}
          onCancel={() => setTwoFAOpen({ check: false })}
          onSubmit={handleCreateOnSubmit}
          onSignIn={handleEnable2FAWithNewEmail}
        />
      </Stack>
    </Dialog>, [twoFAOpen.create, user]);


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
        </Stack>
        {memoCheckCode}
        {memoCreateCode}
      </Form>
    </FormikProvider>
  );
}
