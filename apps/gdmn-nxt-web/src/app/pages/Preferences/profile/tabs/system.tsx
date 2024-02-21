import Confirmation from '@gdmn-nxt/components/helpers/confirmation';
import useObjectsComparator from '@gdmn-nxt/components/helpers/hooks/useObjectsComparator';
import { ContractType, ISystemSettings } from '@gsbelarus/util-api-types';
import { Box, Button, FormControl, InputLabel, MenuItem, Select, Stack } from '@mui/material';
import { useGetSystemSettingsQuery, useSetSystemSettingsMutation } from 'apps/gdmn-nxt-web/src/app/features/systemSettings';
import { Form, FormikProvider, useFormik } from 'formik';
import { useMemo, useState } from 'react';
import * as yup from 'yup';

export default function SystemTab() {
  const compareObjects = useObjectsComparator();
  const { data: settings, isFetching } = useGetSystemSettingsQuery(undefined, { refetchOnMountOrArgChange: true });
  const [setSettings, { isLoading: updateIsLoading }] = useSetSystemSettingsMutation();

  const initValue: ISystemSettings = useMemo(() => ({
    ID: -1,
    CONTRACTTYPE: ContractType.GS,
  }), []);

  const formik = useFormik<ISystemSettings>({
    enableReinitialize: true,
    validateOnBlur: false,
    initialValues: {
      ...initValue,
      ...settings
    },
    onSubmit: (values) => {
      setSettings({
        ...settings,
        ...values
      });
    },
  });

  const onConfirm = () => {
    formik.submitForm();
  };

  return (
    <FormikProvider value={formik}>
      <Form id="systemTabForm" onSubmit={formik.handleSubmit}>
        <Stack height={'100%'}>
          <FormControl size="small" style={{ width: 200 }}>
            <InputLabel id="select-label">Тип договоров</InputLabel>
            <Select
              labelId="select-label"
              value={formik.values.CONTRACTTYPE?.toString() ?? ContractType.GS.toString()}
              label="Тип договоров"
              onChange={(e) => {
                formik.setFieldValue('CONTRACTTYPE', Number(e.target.value));
              }}
            >
              {Object
                .keys(ContractType)
                .filter(key => !isNaN(Number(key)))
                .map(key => (
                  <MenuItem key={key} value={key}>{ContractType[Number(key)]}</MenuItem>
                ))}
            </Select>
          </FormControl>
          <Box flex={1} />
          <Confirmation
            title="Сохранение изменений"
            dangerous
            onConfirm={onConfirm}
          >
            <Button
              variant="contained"
              disabled={compareObjects(formik.values, settings ?? {}) || isFetching}
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
