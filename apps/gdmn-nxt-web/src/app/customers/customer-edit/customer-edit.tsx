import styles from './customer-edit.module.less';
import {
  Autocomplete,
  Button,
  Checkbox,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  Box,
  Tab
} from '@mui/material';
import { ICustomer, ILabel } from '@gsbelarus/util-api-types';
import { useEffect, useState } from 'react';
import { Form, FormikProvider, getIn, useFormik } from 'formik';
import * as yup from 'yup';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { useGetBusinessProcessesQuery } from '../../features/business-processes';
import CustomizedDialog from '../../components/Styled/customized-dialog/customized-dialog';
import TelephoneInput, { validatePhoneNumber } from '@gdmn-nxt/components/telephone-input';
import usePermissions from '@gdmn-nxt/components/helpers/hooks/usePermissions';
import PermissionsGate from '@gdmn-nxt/components/Permissions/permission-gate/permission-gate';
import ItemButtonDelete from '@gdmn-nxt/components/item-button-delete/item-button-delete';
import Confirmation from '@gdmn-nxt/components/helpers/confirmation';
import { LabelsSelect } from '@gdmn-nxt/components/Labels/labels-select';
import CustomerInfo from '../CustomerDetails/customer-info/customer-info';
import ActCompletion from '../CustomerDetails/act-completion/act-completion';
import BankStatement from '../CustomerDetails/bank-statement/bank-statement';
import ContractsList from '../CustomerDetails/contracts-list/contracts-list';
import CustomerDeals from '../CustomerDetails/customer-deals/customer-deals';
import { emailValidation } from '@gdmn-nxt/components/helpers/validators';
import { CustomerContacts } from '../CustomerDetails/customer-contacts';

export interface CustomerEditProps {
  open: boolean;
  deleteable?: boolean;
  customer: ICustomer | null;
  onSubmit: (arg1: ICustomer, arg2: boolean) => void;
  onCancel: () => void;
}

export function CustomerEdit({
  open,
  customer,
  deleteable,
  onCancel,
  onSubmit
}: CustomerEditProps) {
  const { data: businessProcesses = [], isFetching: businessProcessesFetching } = useGetBusinessProcessesQuery();

  const userPermissions = usePermissions();

  const [tabIndex, setTabIndex] = useState('1');
  const [deleting, setDeleting] = useState(false);

  const handleDeleteClick = () => {
    setDeleting(true);
  };

  const handleTabsChange = (event: any, newindex: string) => {
    setTabIndex(newindex);
  };

  const initValue: ICustomer = {
    ID: customer?.ID || 0,
    NAME: customer?.NAME || '',
    PHONE: customer?.PHONE || '',
    EMAIL: customer?.EMAIL || '',
    LABELS: customer?.LABELS || [],
    ADDRESS: customer?.ADDRESS || '',
    TAXID: customer?.TAXID || ''
  };

  const formik = useFormik<ICustomer>({
    enableReinitialize: true,
    validateOnBlur: false,
    initialValues: {
      ...customer,
      ...initValue
    },
    validationSchema: yup.object().shape({
      NAME: yup
        .string()
        .required('')
        .max(80, 'Слишком длинное наименование'),
      EMAIL: emailValidation(),
      PHONE: yup
        .string()
        .test('',
          ({ value }) => validatePhoneNumber(value) ?? '',
          (value = '') => !validatePhoneNumber(value))
    }),
    onSubmit: () => {
      setDeleting(false);
    },
  });

  useEffect(() => {
    if (!open) {
      formik.resetForm();
      if (tabIndex !== '1') setTabIndex('1');
    };
  }, [open]);

  const handleLabelsChange = (labels: ILabel[]) => {
    formik.setFieldValue('LABELS', labels);
  };

  const handlePhoneChange = (value: string) => {
    formik.setFieldValue('PHONE', value);
  };

  const handleSubmit = async () => {
    await formik.submitForm();

    if (!formik.isValid) return;
    onSubmit(formik.values, deleting);
  };

  return (
    <CustomizedDialog
      open={open}
      onClose={onCancel}
      width="calc(100% - var(--menu-width))"
    >
      <DialogTitle>
        {customer ? 'Редактирование клиента' : 'Добавление клиента'}
      </DialogTitle>
      <DialogContent dividers style={{ display: 'grid' }}>
        <FormikProvider value={formik}>
          <Form id="customerEditForm" onSubmit={formik.handleSubmit}>
            <Stack
              direction="row"
              spacing={2}
              height="100%"
            >
              <Stack
                className={styles.editPanel}
                spacing={2}
              >
                <TextField
                  label="Наименование"
                  type="text"
                  required
                  autoFocus
                  multiline
                  name="NAME"
                  onChange={formik.handleChange}
                  value={formik.values.NAME}
                  helperText={getIn(formik.touched, 'NAME') && getIn(formik.errors, 'NAME')}
                  error={getIn(formik.touched, 'NAME') && Boolean(getIn(formik.errors, 'NAME'))}
                />
                <TextField
                  label="УНП"
                  type="text"
                  name="TAXID"
                  onChange={formik.handleChange}
                  value={formik.values.TAXID}
                />
                <TextField
                  label="Email"
                  type="text"
                  name="EMAIL"
                  onChange={formik.handleChange}
                  value={formik.values.EMAIL}
                  helperText={getIn(formik.touched, 'EMAIL') && getIn(formik.errors, 'EMAIL')}
                  error={getIn(formik.touched, 'EMAIL') && Boolean(getIn(formik.errors, 'EMAIL'))}
                  fullWidth
                />
                <TelephoneInput
                  name="PHONE"
                  label="Телефон"
                  value={formik.values.PHONE ?? ''}
                  onChange={handlePhoneChange}
                  fullWidth
                  fixedCode
                  strictMode
                  helperText={getIn(formik.touched, 'PHONE') && getIn(formik.errors, 'PHONE')}
                  error={getIn(formik.touched, 'PHONE') && Boolean(getIn(formik.errors, 'PHONE'))}
                />
                <TextField
                  label="Адрес"
                  multiline
                  minRows={1}
                  type="text"
                  name="ADDRESS"
                  onChange={formik.handleChange}
                  value={formik.values.ADDRESS}
                  placeholder="Введите адрес"
                  helperText={getIn(formik.touched, 'ADDRESS') && getIn(formik.errors, 'ADDRESS')}
                  error={getIn(formik.touched, 'ADDRESS') && Boolean(getIn(formik.errors, 'ADDRESS'))}
                />
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  limitTags={2}
                  options={businessProcesses}
                  loading={businessProcessesFetching}
                  getOptionLabel={option => option.NAME ?? ''}
                  value={
                    businessProcesses?.filter(bp => formik.values.BUSINESSPROCESSES?.find(el => el.ID === bp.ID))
                  }
                  onChange={(e, value) => {
                    formik.setFieldValue(
                      'BUSINESSPROCESSES',
                      value || initValue.BUSINESSPROCESSES
                    );
                  }}
                  renderOption={(props, option, { selected }) => (
                    <li {...props} key={option.ID}>
                      <Checkbox
                        icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                        checkedIcon={<CheckBoxIcon fontSize="small" />}
                        checked={selected}
                      />
                      {option.NAME}
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Бизнес-процессы"
                      placeholder="Выберите бизнес-процессы"
                    />
                  )}
                />
                <LabelsSelect labels={formik.values.LABELS} onChange={handleLabelsChange} />
              </Stack>
              <Divider orientation="vertical" flexItem />
              <Stack flex={1}>
                <TabContext value={tabIndex}>
                  <TabList
                    className={styles.tabHeaderRoot}
                    onChange={handleTabsChange}
                    variant="scrollable"
                    scrollButtons="auto"
                  >
                    <Tab
                      className={styles.tabHeader}
                      label="Контакты"
                      value="1"
                    />
                    <Tab
                      className={styles.tabHeader}
                      label="Реквизиты"
                      value="2"
                    />
                    <Tab
                      className={styles.tabHeader}
                      label="Акты выполненных работ"
                      value="3"
                    />
                    <Tab
                      className={styles.tabHeader}
                      label="Выписки по р/с"
                      value="4"
                    />
                    <Tab
                      className={styles.tabHeader}
                      label="Договоры"
                      value="5"
                    />
                    <Tab
                      className={styles.tabHeader}
                      label="Сделки"
                      value="6"
                    />
                  </TabList>
                  <Divider />
                  <TabPanel value="1" className={tabIndex === '1' ? styles.tabPanel : ''} >
                    <CustomerContacts customerId={Number(customer?.ID)} />
                  </TabPanel>
                  <TabPanel value="2" className={tabIndex === '2' ? styles.tabPanel : ''} >
                    <CustomerInfo customerId={Number(customer?.ID)} />
                  </TabPanel>
                  <TabPanel value="3" className={tabIndex === '3' ? styles.tabPanel : ''}>
                    <ActCompletion customerId={Number(customer?.ID)} />
                  </TabPanel>
                  <TabPanel value="4" className={tabIndex === '4' ? styles.tabPanel : ''} >
                    <BankStatement companyId={Number(customer?.ID)} />
                  </TabPanel>
                  <TabPanel value="5" className={tabIndex === '5' ? styles.tabPanel : ''} >
                    <ContractsList companyId={Number(customer?.ID)} />
                  </TabPanel>
                  <TabPanel value="6" className={tabIndex === '6' ? styles.tabPanel : ''} >
                    <CustomerDeals customerId={Number(customer?.ID)} />
                  </TabPanel>
                </TabContext>
              </Stack>
            </Stack>
          </Form>
        </FormikProvider>
      </DialogContent>
      <DialogActions>
        {customer && deleteable &&
          <PermissionsGate actionAllowed={userPermissions?.customers?.DELETE}>
            <Confirmation
              key="delete"
              title="Удаление клиента"
              text={`Вы действительно хотите удалить клиента ${customer?.NAME}?`}
              dangerous
              onConfirm={handleDeleteClick}
            >
              <ItemButtonDelete button />
            </Confirmation>
          </PermissionsGate>
        }
        <Box flex={1}/>
        <Button
          className={styles.button}
          onClick={onCancel}
          variant="outlined"
          color="primary"
        >
             Отменить
        </Button>
        <PermissionsGate actionAllowed={userPermissions?.customers?.PUT} show>
          <Confirmation
            key="save"
            title="Сохранение клиента"
            text={'Вы действительно хотите сохранить изменения?'}
            onConfirm={handleSubmit}
          >
            <Button
              className={styles.button}
              variant="contained"
              disabled={!userPermissions?.customers?.PUT}
            >
              Сохранить
            </Button>
          </Confirmation>
        </PermissionsGate>

      </DialogActions>
    </CustomizedDialog>
  );
}

export default CustomerEdit;
