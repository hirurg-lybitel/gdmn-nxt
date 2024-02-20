import EditableAvatar from '@gdmn-nxt/components/editable-avatar/editable-avatar';
import useUserData from '@gdmn-nxt/components/helpers/hooks/useUserData';
import { Box, Button, Stack, TextField } from '@mui/material';
import { useGetProfileSettingsQuery, useSetProfileSettingsMutation } from 'apps/gdmn-nxt-web/src/app/features/profileSettings';
import { Form, FormikProvider, getIn, useFormik } from 'formik';
import { IProfileSettings } from '@gsbelarus/util-api-types';
import useObjectsComparator from '@gdmn-nxt/components/helpers/hooks/useObjectsComparator';
import Confirmation from '@gdmn-nxt/components/helpers/confirmation';

export default function AccountTab() {
  const userProfile = useUserData();
  const compareObjects = useObjectsComparator();
  const { data: settings, isLoading } = useGetProfileSettingsQuery(userProfile?.id ?? -1);
  const [setSettings, { isLoading: updateIsLoading }] = useSetProfileSettingsMutation();

  const formik = useFormik<IProfileSettings>({
    enableReinitialize: true,
    validateOnBlur: false,
    initialValues: {
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

  const handleAvatarChange = (value = '') => {
    formik.setFieldValue('AVATAR', value);
  };

  const onConfirm = () => {
    formik.submitForm();
  };

  return (
    <FormikProvider value={formik}>
      <Form id="accountTabForm" onSubmit={formik.handleSubmit}>
        <Stack height={'100%'}>
          <Stack direction="row" spacing={2}>
            <EditableAvatar
              size={120}
              value={formik.values.AVATAR ?? ''}
              onChange={handleAvatarChange}
              loading={isLoading || updateIsLoading}
            />
            <Stack spacing={2} flex={1}>
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Имя"
                  value={userProfile?.userName || ''}
                  disabled
                  fullWidth
                />
                <TextField
                  label="Должность"
                  value={settings?.RANK || ''}
                  disabled
                  fullWidth
                />
              </Stack>
              <TextField
                disabled={isLoading}
                label="Email"
                name="EMAIL"
                onChange={formik.handleChange}
                value={formik.values.EMAIL ?? ''}
                helperText={getIn(formik.touched, 'EMAIL') && getIn(formik.errors, 'EMAIL')}
                error={getIn(formik.touched, 'EMAIL') && Boolean(getIn(formik.errors, 'EMAIL'))}
              />
            </Stack>
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
