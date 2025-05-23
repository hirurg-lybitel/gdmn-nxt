import CustomizedDialog from '@gdmn-nxt/components/Styled/customized-dialog/customized-dialog';
import ItemButtonDelete from '@gdmn-nxt/components/customButtons/item-button-delete/item-button-delete';
import { Accordion, AccordionDetails, AccordionSummary, Autocomplete, Box, Button, Checkbox, DialogActions, DialogContent, DialogTitle, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import { useGetBusinessProcessesQuery } from '../../../features/business-processes';
import { useGetCustomerContractsQuery } from '../../../features/customer-contracts/customerContractsApi';
import { useGetDepartmentsQuery } from '../../../features/departments/departmentsApi';
import { useGetWorkTypesQuery } from '../../../features/work-types/workTypesApi';
import { useGetLabelsQuery } from '../../../features/labels';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import LabelMarker from '@gdmn-nxt/components/Labels/label-marker/label-marker';
import { IBusinessProcess, IContactWithID, ICustomer, ICustomerContract, ILabel, ISegment, ISegmnentField, IWorkType } from '@gsbelarus/util-api-types';
import { Form, FormikProvider, useFormik } from 'formik';
import * as yup from 'yup';
import ConfirmDialog from '../../../confirm-dialog/confirm-dialog';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useGetCustomersQuery } from '../../../features/customer/customerApi_new';
import filterOptions from '@gdmn-nxt/helpers/filter-options';
import { LabelsSelect } from '@gdmn-nxt/components/selectors/labels-select';
import TagIcon from '@mui/icons-material/Tag';
import { DepartmentsSelect } from '@gdmn-nxt/components/selectors/departments-select/departments-select';
import { WorktypesSelect } from '@gdmn-nxt/components/worktypes-select/worktypes-select';
import { ContractsSelect } from '@gdmn-nxt/components/selectors/contracts-select/contracts-select';
import { CustomerSelect } from '@gdmn-nxt/components/selectors/customer-select/customer-select';
import { BusinessProcessesSelect } from '@gdmn-nxt/components/selectors/businessProcesses-select/businessProcesses-select';
import EditDialog from '@gdmn-nxt/components/edit-dialog/edit-dialog';

export interface SegmentUpsertProps {
  segment?: ISegment;
  open: boolean;
  onSubmit: (newSegment: ISegment, deleting?: boolean) => void;
  onCancel: () => void;
}

const fieldNames = ['DEPARTMENTS', 'CUSTOMERCONTRACTS', 'WORKTYPES', 'BUSINESSPROCESSES', 'LABELS'] as const;
type FieldName = typeof fieldNames[number];

export function SegmentUpsert({
  open,
  segment,
  onSubmit,
  onCancel
}: SegmentUpsertProps) {
  const { data: departments, isFetching: departmentsIsFetching } = useGetDepartmentsQuery();
  const { data: contracts, isFetching: customerContractsIsFetching } = useGetCustomerContractsQuery();
  const { data: businessProcesses = [], isFetching: businessProcessesFetching } = useGetBusinessProcessesQuery();
  const { data: labels, isFetching: labelsIsFetching } = useGetLabelsQuery();
  const { data: workTypes, isFetching: workTypesIsFetching } = useGetWorkTypesQuery();
  const { data: customersData, isFetching: customerFetching } = useGetCustomersQuery();
  const customers: ICustomer[] = useMemo(() => [...customersData?.data || []], [customersData?.data]);

  const findValue = (data: any[] = [], value: string) => {
    if (!data) return [];
    const unjoinValues = value.split(',');
    const values = [];
    for (const element of unjoinValues) {
      const value = data?.find((el: any) => Number(element) === el?.ID);
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
      switch (values[i].NAME as FieldName) {
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
    CUSTOMERS: customers?.filter(customer => segment?.CUSTOMERS && segment?.CUSTOMERS.find((el: number) => el === customer.ID))
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
    onSubmit: (_, { resetForm }) => {
      onSubmit(getNewValues(), false);
      resetForm();
    }
  });

  const handleDeleteClick = () => {
    onSubmit(getNewValues(), true);
    formik.resetForm();
  };

  const onClose = () => {
    onCancel();
    formik.resetForm();
  };
  const fieldsParse = (NAME: FieldName): ISegmnentField[] => {
    if (formik.values[NAME].length === 0) return [];
    const values = [{ NAME, VALUE: formik.values[NAME].map((value: any) => value.ID).toString() }];
    return values;
  };

  const getNewValues = useCallback((): ISegment => {
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
      CUSTOMERS: formik.values.CUSTOMERS?.map(customer => customer.ID) || []
    };
  }, [formik.values, segment]);

  const handleAutocompleteChange = useCallback((fieldName: string) => (e: any, value: any) => {
    formik.setFieldValue(fieldName, value);

    if (fieldName === 'CUSTOMERS') {
      return fieldNames.forEach(fieldName => formik.setFieldValue(fieldName, []));
    }

    formik.setFieldValue('CUSTOMERS', []);
  }, []);

  return (
    <EditDialog
      open={open}
      onClose={onClose}
      form="segmentForm"
      title={segment ? `Редактирование: ${segment.NAME}` : 'Добавление нового сегмента'}
      confirmation={formik.dirty}

      deleteButton={!!segment}
      onDeleteClick={handleDeleteClick}
    >
      <FormikProvider value={formik}>
        <Form
          id="segmentForm"
          onSubmit={formik.handleSubmit}
        >
          <Stack spacing={2}>
            <TextField
              autoFocus
              label="Наименование"
              name="NAME"
              value={formik.values.NAME}
              onChange={formik.handleChange}
              error={formik.touched.NAME && Boolean(formik.errors.NAME)}
              helperText={formik.touched.NAME && formik.errors.NAME}
            />
            <Accordion
              sx={{
                '& .MuiButtonBase-root': {
                  padding: 0,
                  marginLeft: '12px',
                },
                '& .MuiAccordionDetails-root': {
                  paddingRight: 0, paddingLeft: 0
                },
                '&:before': { height: '0px' }
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
                    <DepartmentsSelect
                      multiple
                      limitTags={2}
                      value={formik.values.DEPARTMENTS}
                      onChange={(value) => handleAutocompleteChange('DEPARTMENTS')({}, value)}
                      disableCloseOnSelect
                    />
                  </Box>
                  <Box>
                    <ContractsSelect
                      multiple
                      limitTags={2}
                      disableCloseOnSelect
                      onChange={(value) => handleAutocompleteChange('CUSTOMERCONTRACTS')({}, value)}
                      value={formik.values.CUSTOMERCONTRACTS}
                    />
                  </Box>
                  <Box>
                    <WorktypesSelect
                      multiple
                      limitTags={2}
                      disableCloseOnSelect
                      onChange={(value) => handleAutocompleteChange('WORKTYPES')({}, value)}
                      value={formik.values.WORKTYPES}
                    />
                  </Box>
                  <LabelsSelect
                    labels={formik.values.LABELS}
                    onChange={(newLabels) => formik.setFieldValue('LABELS', newLabels)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="end">
                          <TagIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <BusinessProcessesSelect
                    value={formik.values.BUSINESSPROCESSES ?? null}
                    onChange={value => handleAutocompleteChange('BUSINESSPROCESSES')({}, value)}
                    multiple
                    limitTags={2}
                    disableCloseOnSelect
                  />
                </Stack>
              </AccordionDetails>
            </Accordion>
            <CustomerSelect
              value={formik.values.CUSTOMERS}
              disableCloseOnSelect
              multiple
              limitTags={2}
              onChange={value => handleAutocompleteChange('CUSTOMERS')({}, value)}
            />
          </Stack>
        </Form>
      </FormikProvider>
    </EditDialog>
  );
};
