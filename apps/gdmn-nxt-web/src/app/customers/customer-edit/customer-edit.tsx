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
  Tab,
  Tooltip,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { ICustomer, ICustomerFeedback, ILabel } from '@gsbelarus/util-api-types';
import { useEffect, useMemo, useState } from 'react';
import { Form, FormikProvider, getIn, useFormik } from 'formik';
import * as yup from 'yup';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { useGetBusinessProcessesQuery } from '../../features/business-processes';
import CustomizedDialog from '../../components/Styled/customized-dialog/customized-dialog';
import TelephoneInput, { validatePhoneNumber } from '@gdmn-nxt/components/telephone-input';
import usePermissions from '@gdmn-nxt/helpers/hooks/usePermissions';
import PermissionsGate from '@gdmn-nxt/components/Permissions/permission-gate/permission-gate';
import ItemButtonDelete from '@gdmn-nxt/components/customButtons/item-button-delete/item-button-delete';
import { LabelsSelect } from '@gdmn-nxt/components/selectors/labels-select';
import CustomerInfo from '../CustomerDetails/customer-info/customer-info';
import ActCompletion from '../CustomerDetails/act-completion/act-completion';
import BankStatement from '../CustomerDetails/bank-statement/bank-statement';
import ContractsList from '../CustomerDetails/contracts-list/contracts-list';
import CustomerDeals from '../CustomerDetails/customer-deals/customer-deals';
import { emailValidation } from '@gdmn-nxt/helpers/validators';
import { CustomerContacts } from '../CustomerDetails/customer-contacts';
import EmailInput from '@gdmn-nxt/components/email-input/email-input';
import ButtonWithConfirmation from '@gdmn-nxt/components/button-with-confirmation/button-with-confirmation';
import { CustomerFeedback } from '../CustomerDetails/customer-feedback/customer-feedback';
import { CustomerTasks } from '../CustomerDetails/customer-tasks/customer-tasks';
import { BusinessProcessesSelect } from '@gdmn-nxt/components/selectors/businessProcesses-select/businessProcesses-select';
import CustomizedScrollBox from '@gdmn-nxt/components/Styled/customized-scroll-box/customized-scroll-box';
import EditDialog from '@gdmn-nxt/components/edit-dialog/edit-dialog';

export interface CustomerEditProps {
  open: boolean;
  deleteable?: boolean;
  readOnly?: boolean;
  customer: ICustomer | null;
  onSubmit: (arg1: ICustomer, arg2: boolean) => void;
  onCancel: () => void;
}

export function CustomerEdit({
  open,
  customer,
  deleteable,
  readOnly = false,
  onCancel,
  onSubmit
}: CustomerEditProps) {
  const { data: businessProcesses = [], isFetching: businessProcessesFetching } = useGetBusinessProcessesQuery();

  const userPermissions = usePermissions();

  const theme = useTheme();
  const matchDownMd = useMediaQuery(theme.breakpoints.down('md'));

  const defaultTab = matchDownMd ? '0' : (!customer ? '2' : '1');

  const [tabIndex, setTabIndex] = useState(defaultTab);

  const handleTabsChange = (event: any, newindex: string) => {
    setTabIndex(newindex);
  };

  const initValue: ICustomer = {
    ID: customer?.ID ?? 0,
    NAME: customer?.NAME ?? '',
    PHONE: customer?.PHONE ?? '',
    EMAIL: customer?.EMAIL ?? '',
    LABELS: customer?.LABELS || [],
    ADDRESS: customer?.ADDRESS ?? '',
    TAXID: customer?.TAXID ?? ''
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
    onSubmit: (values) => {
      onSubmit(values, false);
    },
  });

  useEffect(() => {
    if (!open) {
      formik.resetForm();
      if (tabIndex !== '1') setTabIndex('1');
      return;
    };
    setTabIndex(defaultTab);
  }, [open]);

  const handleDeleteClick = () => {
    onSubmit(formik.values, true);
  };

  const handleLabelsChange = (labels: ILabel[]) => {
    formik.setFieldValue('LABELS', labels);
  };

  const handlePhoneChange = (value: string) => {
    formik.setFieldValue('PHONE', value);
  };

  const handleFeedbackChange = (value: ICustomerFeedback[]) => {
    formik.setFieldValue('feedback', value);
  };

  const editForm = useMemo(() => {
    return (
      <Stack
        style={{ marginRight: matchDownMd ? '20px' : '16px' }}
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
        <EmailInput
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
        <BusinessProcessesSelect
          value={formik.values.BUSINESSPROCESSES ?? null}
          onChange={value => {
            formik.setFieldValue(
              'BUSINESSPROCESSES',
              value || initValue.BUSINESSPROCESSES
            );
          }}
          multiple
          limitTags={2}
          disableCloseOnSelect
        />
        <LabelsSelect labels={formik.values.LABELS} onChange={handleLabelsChange} />
      </Stack>
    );
  }, [formik, handleLabelsChange, handlePhoneChange, initValue.BUSINESSPROCESSES, matchDownMd]);

  return (
    <EditDialog
      open={open}
      onClose={onCancel}
      form={'customerEditForm'}
      title={customer ? 'Редактирование клиента' : 'Добавление клиента'}
      confirmation={formik.dirty}
      onDeleteClick={handleDeleteClick}
      deleteButton={!!customer && !!deleteable && userPermissions?.customers?.DELETE}
      deleteConfirmText={`Вы действительно хотите удалить клиента ${customer?.NAME}?`}
      fullwidth
      submitButtonDisabled={!userPermissions?.customers?.PUT || readOnly}
      submitHint={readOnly ? 'Карточка в режиме просмотра' : ''}
    >
      <FormikProvider value={formik}>
        <Form
          style={{ flex: 1, minWidth: 0 }}
          id="customerEditForm"
          onSubmit={formik.handleSubmit}
        >
          <Stack
            direction="row"
            spacing={2}
            height="100%"
            width="100%"
          >
            {!matchDownMd && <>
              <div className={styles.editPanel}>
                <CustomizedScrollBox>
                  {editForm}
                </CustomizedScrollBox>
              </div>
              <Divider orientation="vertical" flexItem />
            </>}
            <Stack style={{ minWidth: 0 }} flex={1}>
              <TabContext value={tabIndex}>
                <TabList
                  className={styles.tabHeaderRoot}
                  onChange={handleTabsChange}
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  {matchDownMd && (
                    <Tab
                      className={styles.tabHeader}
                      label="Информация"
                      value="0"
                    />
                  )}
                  <Tab
                    className={styles.tabHeader}
                    label="Общение"
                    value="1"
                    disabled={!customer?.ID}
                  />
                  <Tab
                    className={styles.tabHeader}
                    label="Контакты"
                    value="2"
                  />
                  <Tab
                    className={styles.tabHeader}
                    label="Реквизиты"
                    value="3"
                  />
                  <Tab
                    className={styles.tabHeader}
                    label="Акты выполненных работ"
                    value="4"
                  />
                  <Tab
                    className={styles.tabHeader}
                    label="Выписки по р/с"
                    value="5"
                  />
                  <Tab
                    className={styles.tabHeader}
                    label="Договоры"
                    value="6"
                  />
                  <Tab
                    className={styles.tabHeader}
                    label="Сделки"
                    value="7"
                  />
                  <Tab
                    className={styles.tabHeader}
                    label="Задачи"
                    value="8"
                  />
                </TabList>
                <Divider />
                {matchDownMd && (
                  <TabPanel
                    value="0"
                    className={tabIndex === '0' ? styles.tabPanel : ''}
                  >
                    <div style={{ flex: 1, marginRight: '-20px' }}>
                      <CustomizedScrollBox>
                        <div style={{ paddingBottom: '1px', paddingTop: '5px' }}>
                          {editForm}
                        </div>

                      </CustomizedScrollBox>
                    </div>
                  </TabPanel>
                )
                }
                <TabPanel value="1" className={tabIndex === '1' ? styles.tabPanel : ''} >
                  <CustomerFeedback
                    data={!customer?.ID ? (formik.values.feedback ?? []) : undefined}
                    onChange={handleFeedbackChange}
                    customerId={Number(customer?.ID)}
                  />
                </TabPanel>
                <TabPanel value="2" className={tabIndex === '2' ? styles.tabPanel : ''} >
                  <CustomerContacts customerId={Number(customer?.ID)} />
                </TabPanel>
                <TabPanel value="3" className={tabIndex === '3' ? styles.tabPanel : ''} >
                  <CustomerInfo customerId={Number(customer?.ID)} />
                </TabPanel>
                <TabPanel value="4" className={tabIndex === '4' ? styles.tabPanel : ''}>
                  <ActCompletion customerId={Number(customer?.ID)} />
                </TabPanel>
                <TabPanel value="5" className={tabIndex === '5' ? styles.tabPanel : ''} >
                  <BankStatement companyId={Number(customer?.ID)} />
                </TabPanel>
                <TabPanel value="6" className={tabIndex === '6' ? styles.tabPanel : ''} >
                  <ContractsList companyId={Number(customer?.ID)} />
                </TabPanel>
                <TabPanel value="7" className={tabIndex === '7' ? styles.tabPanel : ''} >
                  <CustomerDeals customerId={Number(customer?.ID)} />
                </TabPanel>
                <TabPanel value="8" className={tabIndex === '8' ? styles.tabPanel : ''} >
                  <CustomerTasks customerId={Number(customer?.ID)} />
                </TabPanel>
              </TabContext>
            </Stack>
          </Stack>
        </Form>
      </FormikProvider>
    </EditDialog>
  );
}

export default CustomerEdit;
