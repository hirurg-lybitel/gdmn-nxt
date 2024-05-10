import InfoIcon from '@mui/icons-material/Info';
import useUserData from '@gdmn-nxt/components/helpers/hooks/useUserData';
import { IProfileSettings } from '@gsbelarus/util-api-types';
import { Box, Button, Checkbox, FormControlLabel, List, ListItem, ListItemIcon, Stack, Tooltip } from '@mui/material';
import { useGetProfileSettingsQuery, useSetProfileSettingsMutation } from 'apps/gdmn-nxt-web/src/app/features/profileSettings';
import { Form, FormikProvider, useFormik } from 'formik';
import { useSnackbar } from '@gdmn-nxt/components/helpers/hooks/useSnackbar';
import addNotification from 'react-push-notification';
import { PUSH_NOTIFICATIONS_DURATION } from '@gdmn/constants/client';
import Confirmation from '@gdmn-nxt/components/helpers/confirmation';
import useObjectsComparator from '@gdmn-nxt/components/helpers/hooks/useObjectsComparator';

export default function NotificationsTab() {
  const userProfile = useUserData();
  const compareObjects = useObjectsComparator();
  const { data: settings, isLoading } = useGetProfileSettingsQuery(userProfile?.id ?? -1);
  const [setSettings, { isLoading: updateIsLoading }] = useSetProfileSettingsMutation();

  const { addSnackbar } = useSnackbar();

  const initValue: Partial<IProfileSettings> = {
    SEND_EMAIL_NOTIFICATIONS: settings?.SEND_EMAIL_NOTIFICATIONS ?? false,
    PUSH_NOTIFICATIONS_ENABLED: settings?.PUSH_NOTIFICATIONS_ENABLED ?? false,
  };

  const formik = useFormik<IProfileSettings>({
    enableReinitialize: true,
    validateOnBlur: false,
    initialValues: {
      ...initValue,
      ...settings
    },
    onSubmit: (values) => {
      setSettings({
        userId: userProfile?.id ?? -1,
        body: {
          ...settings,
          ...values
        }
      });
    },
  });

  const checkPushNotifications = () => {
    const { message, OK } = (() => {
      if (Notification.permission === 'granted') {
        return {
          message: 'Уведомления разрешены в вашем браузере',
          OK: true
        };
      } else if (Notification.permission === 'denied') {
        return {
          message: 'Уведомления отключены в вашем браузере',
          OK: false
        };
      } else {
        /** Запрос разрешения на уведомления */
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            return {
              message: 'Уведомления разрешены в вашем браузере',
              OK: true
            };
          } else {
            return {
              message: 'Уведомления отключены в вашем браузере',
              OK: false
            };
          }
        });
      }
      return {
        message: 'Не удалось провести проверку',
        OK: false
      };
    })();

    addSnackbar(message, {
      variant: OK ? 'success' : 'error',
    });

    if (OK) {
      addNotification({
        title: 'Проверка настроек crm',
        message: 'Push-уведомления успешно подключены',
        native: true,
        duration: PUSH_NOTIFICATIONS_DURATION
      });
    }
  };

  const onConfirm = () => {
    formik.submitForm();
  };

  return (
    <FormikProvider value={formik}>
      <Form id="notificationsTabForm" onSubmit={formik.handleSubmit}>
        <Stack height={'100%'}>
          <Stack direction="row" alignItems="center">
            <FormControlLabel
              disabled={isLoading}
              label="Получать уведомления по почте"
              control={<Checkbox
                name="SEND_EMAIL_NOTIFICATIONS"
                checked={formik.values.SEND_EMAIL_NOTIFICATIONS}
                onChange={formik.handleChange}
              />}
              style={{
                minWidth: '190px',
              }}
            />
            <Tooltip
              style={{ cursor: 'help' }}
              arrow
              title="Новые уведомления будут приходить списком каждый час с 9:00 до 17:00"
            >
              <InfoIcon color="action" />
            </Tooltip>
          </Stack>
          <Stack direction="row" alignItems="center">
            <FormControlLabel
              disabled={isLoading}
              label="Push-уведомления"
              control={<Checkbox
                name="PUSH_NOTIFICATIONS_ENABLED"
                checked={formik.values.PUSH_NOTIFICATIONS_ENABLED}
                onChange={formik.handleChange}
              />}
            />
            <Tooltip
              style={{ cursor: 'help' }}
              arrow
              title={<List disablePadding dense>
                <ListItem disableGutters alignItems="flex-start">
                  <ListItemIcon style={{ minWidth: 15, marginTop: 0, color: 'white' }}>
                    1.
                  </ListItemIcon >
                    Убедитесь, что на вашем компьютере включены уведомления от текущего браузера
                </ListItem>
                <ListItem disableGutters alignItems="flex-start">
                  <ListItemIcon style={{ minWidth: 15, marginTop: 0, color: 'white' }}>
                    2.
                  </ListItemIcon >
                    Проверьте, что в вашем браузере включены уведомления, нажав кнопку Проверить
                </ListItem>
              </List>}
            >
              <InfoIcon color="action" />
            </Tooltip>
            <Box flex={1} />
            <Button variant="contained" onClick={checkPushNotifications}>Проверить</Button>
          </Stack>
          <Box flex={1}/>
          <Confirmation
            title="Сохранение изменений"
            dangerous
            onConfirm={onConfirm}
          >
            <Button
              variant="contained"
              disabled={compareObjects(formik.values, settings ?? {}) || isLoading}
              style={{ alignSelf: 'flex-start' }}
            >
            Сохранить
            </Button>
          </Confirmation>
        </Stack>
      </Form>
    </FormikProvider>
  );
}
