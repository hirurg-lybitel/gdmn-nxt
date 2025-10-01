import InfoIcon from '@mui/icons-material/Info';
import useUserData from '@gdmn-nxt/helpers/hooks/useUserData';
import { IProfileSettings, UserType } from '@gsbelarus/util-api-types';
import { Box, Button, Checkbox, FormControlLabel, List, ListItem, ListItemIcon, Stack, Tooltip } from '@mui/material';
import { useGetProfileSettingsQuery, useSetProfileSettingsMutation } from 'apps/gdmn-nxt-web/src/app/features/profileSettings';
import { Form, FormikProvider, useFormik } from 'formik';
import { useSnackbar } from '@gdmn-nxt/helpers/hooks/useSnackbar';
import addNotification from 'react-push-notification';
import { PUSH_NOTIFICATIONS_DURATION } from '@gdmn/constants/client';
import Confirmation from '@gdmn-nxt/helpers/confirmation';
import useObjectsComparator from '@gdmn-nxt/helpers/hooks/useObjectsComparator';
import ButtonWithConfirmation from '@gdmn-nxt/components/button-with-confirmation/button-with-confirmation';
import { RootState } from '@gdmn-nxt/store';
import { useSelector } from 'react-redux';
import usePermissions from '@gdmn-nxt/helpers/hooks/usePermissions';

export default function NotificationsTab() {
  const userProfile = useUserData();
  const compareObjects = useObjectsComparator();
  const { data: settings, isLoading } = useGetProfileSettingsQuery(userProfile?.id ?? -1);
  const [setSettings, { isLoading: updateIsLoading }] = useSetProfileSettingsMutation();

  const { addSnackbar } = useSnackbar();

  const initValue: Partial<IProfileSettings> = {
    SEND_EMAIL_NOTIFICATIONS: settings?.SEND_EMAIL_NOTIFICATIONS ?? false,
    PUSH_NOTIFICATIONS_ENABLED: settings?.PUSH_NOTIFICATIONS_ENABLED ?? false,
    TICKETS_EMAIL: settings?.TICKETS_EMAIL ?? false,
    ALL_TICKET_EMAIL_NOTIFICATIONS: settings?.ALL_TICKET_EMAIL_NOTIFICATIONS ?? false
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

  const ticketsUser = useSelector<RootState, boolean>(state => state.user.userProfile?.type === UserType.Tickets);
  const isAdmin = useSelector<RootState, boolean>(state => !!state.user.userProfile?.isAdmin);

  const ticketActions = ticketsUser
    ? ['Отправлено сообщение', 'Изменен статус заявки', 'Звонок по заявке завершен']
    : ['Вам назначен тикет', 'Отправлено сообщение', 'Изменен статус тикета', ['Запрошен звонок'], 'Постановщик отклонил/подтвердил выполнение тикета'];

  const userPermissions = usePermissions();

  return (
    <FormikProvider value={formik}>
      <Form id="notificationsTabForm" onSubmit={formik.handleSubmit}>
        <Stack height={'100%'} sx={{ gap: { xs: '10px', sm: 0 } }}>
          {!ticketsUser && <Stack direction="row" alignItems="center">
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
          </Stack>}
          <Stack
            direction="row"
            alignItems="center"
          >
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
              style={{ cursor: 'help', marginRight: '16px' }}
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
          <Stack direction="row" alignItems="center">
            <FormControlLabel
              disabled={isLoading}
              label={ticketsUser ? 'Получать уведомления по почте' : 'Получать уведомления по тикетам на почту'}
              control={<Checkbox
                name="TICKETS_EMAIL"
                checked={formik.values.TICKETS_EMAIL}
                onChange={formik.handleChange}
              />}
              style={{
                minWidth: '190px',
              }}
            />
            <Tooltip
              style={{ cursor: 'help' }}
              arrow
              title={<List disablePadding dense>
                {ticketsUser
                  ? 'Уведомления будут приходить на почту сразу при следующих действиях:'
                  : 'Уведомления, по тикетам в которых вы являетесь исполнителем, будут приходить на почту сразу при следующих действиях:'
                }
                {ticketActions.map((text, index) => {
                  return (
                    <ListItem
                      key={index}
                      disableGutters
                      alignItems="flex-start"
                    >
                      <ListItemIcon style={{ minWidth: 15, marginTop: 0, color: 'white' }}>
                        {index + 1}.
                      </ListItemIcon >
                      {text}
                    </ListItem>
                  );
                })}
              </List>}
            >
              <InfoIcon color="action" />
            </Tooltip>
          </Stack>
          {(userPermissions?.['ticketSystem/tickets/all'].GET || ticketsUser || isAdmin) && <Stack direction="row" alignItems="center">
            <FormControlLabel
              disabled={isLoading}
              label={ticketsUser ? 'Получать уведомления по всем заявкам' : 'Получать уведомления по всем тикетам'}
              control={<Checkbox
                name="ALL_TICKET_EMAIL_NOTIFICATIONS"
                checked={formik.values.ALL_TICKET_EMAIL_NOTIFICATIONS}
                onChange={formik.handleChange}
              />}
              style={{
                minWidth: '190px',
              }}
            />
            <Tooltip
              style={{ cursor: 'help' }}
              arrow
              title={`Уведомления по ${ticketsUser ? 'заявкам' : 'тикетам'}, где вы не являетесь ${ticketsUser ? 'постановщиком' : 'постановщиком или исполнителем'}, будут приходить при их создании и завершении`}
            >
              <InfoIcon color="action" />
            </Tooltip>
          </Stack>}
          <Box flex={1} />
          <ButtonWithConfirmation
            variant="contained"
            disabled={compareObjects(formik.values, settings ?? {}) || isLoading}
            style={{ alignSelf: 'flex-start' }}
            onClick={onConfirm}
            title="Сохранение изменений"
            confirmation={false}
          >
            Сохранить
          </ButtonWithConfirmation>
        </Stack>
      </Form>
    </FormikProvider>
  );
}
