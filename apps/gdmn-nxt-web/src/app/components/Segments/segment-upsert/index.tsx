import CustomizedDialog from '@gdmn-nxt/components/Styled/customized-dialog/customized-dialog';
import Confirmation from '@gdmn-nxt/components/helpers/confirmation';
import ItemButtonDelete from '@gdmn-nxt/components/item-button-delete/item-button-delete';
import { Accordion, AccordionDetails, AccordionSummary, Autocomplete, Box, Button, Checkbox, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import { useGetBusinessProcessesQuery } from '../../../features/business-processes';
import { useGetCustomerContractsQuery } from '../../../features/customer-contracts/customerContractsApi';
import { useGetDepartmentsQuery } from '../../../features/departments/departmentsApi';
import { useGetWorkTypesQuery } from '../../../features/work-types/workTypesApi';
import { LabelsResponse, useGetLabelsQuery } from '../../../features/labels';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import LabelMarker from '@gdmn-nxt/components/Labels/label-marker/label-marker';
import { IBusinessProcess, IContactWithID, ICustomer, ICustomerContract, ILabel, ISegment, ISegmnentField, IWorkType } from '@gsbelarus/util-api-types';
import { Form, FormikProvider, useFormik } from 'formik';
import * as yup from 'yup';
import { ErrorTooltip } from '@gdmn-nxt/components/Styled/error-tooltip/error-tooltip';
import ConfirmDialog from '../../../confirm-dialog/confirm-dialog';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useGetCustomersQuery } from '../../../features/customer/customerApi_new';
import filterOptions from '@gdmn-nxt/components/helpers/filter-options';

export interface SegmentUpsertProps {
  segment?: ISegment;
  open: boolean;
  onSubmit: (newSegment: ISegment, deleting?: boolean) => void;
  onCancel: () => void;
}

type fieldNames = 'DEPARTMENTS' | 'CUSTOMERCONTRACTS' | 'WORKTYPES' | 'BUSINESSPROCESSES' | 'LABELS';

export function SegmentUpsert({
  open,
  segment,
  onSubmit,
  onCancel
}: SegmentUpsertProps) {
  const { data: departments, isFetching: departmentsIsFetching } = useGetDepartmentsQuery();
  const { data: contracts, isFetching: customerContractsIsFetching } = useGetCustomerContractsQuery();
  // const { data: labels, isFetching: labelsIsFetching } = useGetGroupsQuery();
  const { data: businessProcesses = [], isFetching: businessProcessesFetching } = useGetBusinessProcessesQuery();
  const { data: labels, isFetching: labelsIsFetching } = useGetLabelsQuery();
  const { data: workTypes, isFetching: workTypesIsFetching } = useGetWorkTypesQuery();
  const { data: customersData, isFetching: customerFetching } = useGetCustomersQuery();
  const customers: ICustomer[] = useMemo(() => [...customersData?.data || []], [customersData?.data]);

  const findValue = (mas: any | undefined, value: string) => {
    if (!mas) return [];
    const unjoinValues = value.split(',');
    const values = [];
    for (let i = 0;i < unjoinValues.length;i++) {
      const value = mas?.find((el: any) => Number(unjoinValues[i]) === el?.ID);
      if (!value) break;
      values.push(value);
    }
    return values;
  };

  const getFields = () => {
    const values = segment?.FIELDS || [];

    let businessProcessesFields: IBusinessProcess[] = [];
    let contractsFields: ICustomerContract[] = [];
    let departmentsFields: IContactWithID[] = [];
    let labelsFields: ILabel[] = [];
    let workTypesFields: IWorkType[] = [];

    for (let i = 0;i < values.length;i++) {
      switch (values[i].NAME as fieldNames) {
        case 'BUSINESSPROCESSES': {
          businessProcessesFields = findValue(businessProcesses, values[i].VALUE);
          break;
        }
        case 'CUSTOMERCONTRACTS': {
          contractsFields = findValue(contracts, values[i].VALUE);
          break;
        }
        case 'DEPARTMENTS': {
          departmentsFields = findValue(departments, values[i].VALUE);
          break;
        }
        case 'LABELS': {
          labelsFields = findValue(labels, values[i].VALUE);
          break;
        }
        case 'WORKTYPES': {
          workTypesFields = findValue(workTypes, values[i].VALUE);
          break;
        }
      }
    }
    return {
      DEPARTMENTS: departmentsFields,
      CUSTOMERCONTRACTS: contractsFields,
      BUSINESSPROCESSES: businessProcessesFields,
      LABELS: labelsFields,
      WORKTYPES: workTypesFields
    };
  };

  interface IFormikValues {
    NAME: string,
    BUSINESSPROCESSES: IBusinessProcess[],
    CUSTOMERCONTRACTS: ICustomerContract[],
    DEPARTMENTS: IContactWithID[],
    LABELS: ILabel[],
    WORKTYPES: IWorkType[],
    CUSTOMERS: ICustomer[]
  }

  const initValue = {
    NAME: segment?.NAME || '',
    ...getFields(),
    CUSTOMERS: []
  };

  const formik = useFormik<IFormikValues>({
    enableReinitialize: true,
    validateOnBlur: false,
    validateOnChange: false,
    initialValues: {
      ...initValue
    },
    validationSchema: yup.object().shape({
      NAME: yup.string()
        .required('Имя не указано')
        .max(40, 'Слишком длинное имя'),
    }),
    onSubmit: (values) => {
    },
    onReset: (values) => {
    }
  });

  const handleDeleteClick = () => {
    handleSubmit(true);
  };

  const onClose = () => {
    setConfirmOpen(false);
    onCancel();
    formik.resetForm();
  };
  const fieldsParse = (NAME: fieldNames): ISegmnentField[] => {
    if (formik.values[`${NAME}`].length === 0) return [];
    const values = [{ NAME: NAME + '', VALUE: formik.values[`${NAME}`].map((value: any) => value.ID + '').toString() }];
    return values;
  };

  const getNewValues = useCallback(() => {
    const customers = formik.values.CUSTOMERS.map(el => el.ID);
    return {
      ID: segment?.ID || -1,
      NAME: formik.values.NAME,
      QUANTITY: segment?.QUANTITY || 0,
      FIELDS: [
        ...fieldsParse('BUSINESSPROCESSES'),
        ...fieldsParse('LABELS'),
        ...fieldsParse('CUSTOMERCONTRACTS'),
        ...fieldsParse('DEPARTMENTS'),
        ...fieldsParse('WORKTYPES')
      ],
      CUSTOMERS: customers.length < 1 ? undefined : customers.toString()
    };
  }, [formik.values, segment]);

  const handleSubmit = (isDelete: boolean) => {
    setConfirmOpen(false);
    const values: ISegment = getNewValues();
    formik.resetForm();
    onSubmit(values, isDelete);
  };

  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleCancel = () => {
    setConfirmOpen(false);
  };

  const handleSubmitClick = async () => {
    const errors = await formik.validateForm(formik.values);
    if (Object.keys(errors).length !== 0) return;
    handleSubmit(false);
  };

  const handleCancelClick = () => {
    if (formik.dirty) {
      setConfirmOpen(true);
      return;
    }
    onClose();
  };

  const memoConfirmDialog = useMemo(() =>
    <ConfirmDialog
      open={confirmOpen}
      title={'Внимание'}
      text={'Изменения будут утеряны. Продолжить?'}
      confirmClick={onClose}
      cancelClick={handleCancel}
    />,
  [confirmOpen, handleCancel]);

  return (
    <>
      <FormikProvider value={formik}>
        <Form
          id="segmentForm"
          onSubmit={formik.handleSubmit}
        >
          <CustomizedDialog
            open={open}
            onClose={handleCancelClick}
            width="calc(100% - var(--menu-width))"
          >
            <DialogTitle>
              {segment ? `Редактирование: ${segment.NAME}` : 'Добавление нового сегмента'}
            </DialogTitle>
            <DialogContent dividers>
              <Stack spacing={2}>
                <ErrorTooltip
                  open={(open && !!formik.errors.NAME)}
                  title={formik.errors.NAME}
                >
                  <TextField
                    label="Имя"
                    value={formik.values.NAME}
                    onChange={(e) => formik.setFieldValue('NAME', e.target.value)}
                  />
                </ErrorTooltip>
                <Accordion
                  sx={{
                    '& .MuiButtonBase-root': {
                      padding: 0
                    },
                    '& .MuiAccordionDetails-root': {
                      paddingRight: 0, paddingLeft: 0
                    }
                  }}
                  defaultExpanded
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                  >
                    Список полей для фильтрации клиентов
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={2}>
                      <Box>
                        <Autocomplete
                          multiple
                          limitTags={2}
                          disableCloseOnSelect
                          options={departments || []}
                          onChange={(e, value) => formik.setFieldValue('DEPARTMENTS', value)}
                          value={
                            departments?.filter(department => formik.values.DEPARTMENTS && formik.values.DEPARTMENTS.find(el => el.ID === department.ID))
                          }
                          getOptionLabel={option => option.NAME}
                          renderOption={(props, option, { selected }) => (
                            <li {...props} key={option.ID}>
                              <Checkbox
                                icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                                checkedIcon={<CheckBoxIcon fontSize="small" />}
                                style={{ marginRight: 8 }}
                                checked={selected}
                              />
                              {option.NAME}
                            </li>
                          )}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Отдел"
                              placeholder="Выберите отделы"
                            />
                          )}
                          loading={departmentsIsFetching}
                          loadingText="Загрузка данных..."
                        />
                      </Box>
                      <Box>
                        <Autocomplete
                          multiple
                          limitTags={2}
                          disableCloseOnSelect
                          options={contracts || []}
                          onChange={(e, value) => formik.setFieldValue('CUSTOMERCONTRACTS', value)}
                          value={
                            contracts?.filter(contract => formik.values.CUSTOMERCONTRACTS && formik.values.CUSTOMERCONTRACTS.find(el => el.ID === contract.ID))
                          }
                          getOptionLabel={option => option.USR$NUMBER}
                          renderOption={(props, option, { selected }) => (
                            <li {...props} key={option.ID}>
                              <Checkbox
                                icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                                checkedIcon={<CheckBoxIcon fontSize="small" />}
                                style={{ marginRight: 8 }}
                                checked={selected}
                              />
                              {option.USR$NUMBER}
                            </li>
                          )}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Заказы"
                              placeholder="Выберите заказы"
                            />
                          )}
                          loading={customerContractsIsFetching}
                          loadingText="Загрузка данных..."
                        />
                      </Box>
                      <Box>
                        <Autocomplete
                          multiple
                          limitTags={2}
                          disableCloseOnSelect
                          // filterOptions={filterOptions(30, 'USR$NAME')}
                          options={workTypes || []}
                          onChange={(e, value) => formik.setFieldValue('WORKTYPES', value)}
                          value={
                            workTypes?.filter(wt => formik.values.WORKTYPES && formik.values.WORKTYPES.find(el => el.ID === wt.ID))
                          }
                          getOptionLabel={option => option.USR$NAME || ''}
                          renderOption={(props, option, { selected }) => (
                            <li {...props} key={option.ID}>
                              <Checkbox
                                icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                                checkedIcon={<CheckBoxIcon fontSize="small" />}
                                style={{ marginRight: 8 }}
                                checked={selected}
                              />
                              {option.USR$NAME}
                            </li>
                          )}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Виды работ"
                              placeholder="Выберите виды работ"
                            />
                          )}
                          loading={workTypesIsFetching}
                          loadingText="Загрузка данных..."
                        />
                      </Box>
                      <Autocomplete
                        multiple
                        limitTags={2}
                        disableCloseOnSelect
                        options={labels || []}
                        onChange={(e, value) => formik.setFieldValue('LABELS', value)}
                        value={
                          labels?.filter(label => formik.values.LABELS && formik.values.LABELS.find(el => el.ID === label.ID))
                        }
                        getOptionLabel={option => option.USR$NAME}
                        renderOption={(props, option, { selected }) => (
                          <li {...props} key={option.ID}>
                            <Checkbox
                              icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                              checkedIcon={<CheckBoxIcon fontSize="small" />}
                              style={{ marginRight: 8 }}
                              checked={selected}
                            />
                            <Stack direction="column">
                              <Stack direction="row">
                                <Box
                                  component="span"
                                  sx={{
                                    width: 14,
                                    height: 14,
                                    borderRadius: '12px',
                                    mr: 1,
                                    alignSelf: 'center',
                                    backgroundColor: option.USR$COLOR
                                  }}
                                />
                                <Box>
                                  {option.USR$NAME}
                                </Box>
                              </Stack>
                              <Typography variant="caption">{option.USR$DESCRIPTION}</Typography>
                            </Stack>
                          </li>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Метки"
                            placeholder="Выберите метки"
                          />
                        )}
                        renderTags={(value: readonly ILabel[], getTagProps) =>
                          value.map((option: ILabel, index: number) =>
                            <Box key={index} pr={0.5}>
                              <LabelMarker label={option} {...getTagProps({ index })}/>
                            </Box>
                          )
                        }
                        loading={labelsIsFetching}
                        loadingText="Загрузка данных..."
                      />
                      <Autocomplete
                        multiple
                        limitTags={2}
                        disableCloseOnSelect
                        options={businessProcesses}
                        onChange={(e, value) => formik.setFieldValue('BUSINESSPROCESSES', value)}
                        value={
                          businessProcesses?.filter(businessProcess => formik.values.BUSINESSPROCESSES && formik.values.BUSINESSPROCESSES.find(el => el.ID === businessProcess.ID))
                        }
                        getOptionLabel={option => option.NAME}
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
                        loading={businessProcessesFetching}
                        loadingText="Загрузка данных..."
                      />
                    </Stack>
                  </AccordionDetails>
                </Accordion>
                <Autocomplete
                  disabled
                  options={customers}
                  onChange={(e, value) => formik.setFieldValue('CUSTOMERS', value)}
                  value={
                    customers?.filter(customer => formik.values.CUSTOMERS && formik.values.CUSTOMERS.find((el: any) => el.ID === customer.ID))
                  }
                  multiple
                  limitTags={2}
                  filterOptions={filterOptions(50, 'NAME')}
                  getOptionLabel={option => option.NAME}
                  renderOption={(props, option, { selected }) => (
                    <li {...props} key={option.ID}>
                      <Checkbox
                        icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                        checkedIcon={<CheckBoxIcon fontSize="small" />}
                        style={{ marginRight: 8 }}
                        checked={selected}
                      />
                      {option.NAME}
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Клиент"
                      placeholder="Выберите клиентов"
                    />
                  )}
                  loading={customerFetching}
                  loadingText="Загрузка данных..."
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              {segment && <ItemButtonDelete onClick={handleDeleteClick} button />}
              <Box flex={1}/>
              <Button
                // className={styles.button}
                onClick={handleCancelClick}
                variant="outlined"
                color="primary"
              >
                Отменить
              </Button>
              {/* <PermissionsGate actionAllowed={userPermissions?.customers?.PUT} show> */}
              <Button
                variant="contained"
                form="segmentForm"
                type="submit"
                onClick={handleSubmitClick}
                // disabled={!userPermissions?.customers?.PUT}
              >
                Сохранить
              </Button>
              {/* </PermissionsGate> */}
            </DialogActions>
          </CustomizedDialog>
        </Form>
      </FormikProvider>
      {memoConfirmDialog}
    </>
  );
};
