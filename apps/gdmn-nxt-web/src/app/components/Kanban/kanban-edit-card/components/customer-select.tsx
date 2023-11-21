import { ICustomer, IKanbanCard } from '@gsbelarus/util-api-types';
import { Autocomplete, Box, Button, FilterOptionsState, IconButton, TextField, Typography, createFilterOptions } from '@mui/material';
import CustomerEdit from 'apps/gdmn-nxt-web/src/app/customers/customer-edit/customer-edit';
import { useAddCustomerMutation, useGetCustomersQuery, useUpdateCustomerMutation } from 'apps/gdmn-nxt-web/src/app/features/customer/customerApi_new';
import { FormikProps, getIn } from 'formik';
import { HTMLAttributes, useCallback, useEffect, useMemo, useState } from 'react';
import CustomPaperComponent from '../../../helpers/custom-paper-component/custom-paper-component';
import filterOptions from '../../../helpers/filter-options';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import EditIcon from '@mui/icons-material/Edit';

interface CustomerSelectProps {
  formik: FormikProps<IKanbanCard>;
};

export function CustomerSelect(props: CustomerSelectProps) {
  const { formik } = props;

  const { data: customersResponse, isFetching: customersIsFetching } = useGetCustomersQuery();
  const customers: ICustomer[] = useMemo(
    () => [...(customersResponse?.data || [])],
    [customersResponse?.data]
  );

  const [insertCustomer, { isSuccess: insertCustomerIsSuccess, isLoading: insertCustomerIsLoading, data: newCustomer }] = useAddCustomerMutation();
  const [updateCustomer] = useUpdateCustomerMutation();

  const [addCustomer, setAddCustomer] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<ICustomer | null>(null);

  useEffect(() => {
    insertCustomerIsSuccess && (formik.values.DEAL?.CONTACT?.ID !== newCustomer?.ID) && formik.setFieldValue('DEAL.CONTACT', newCustomer);
  }, [insertCustomerIsSuccess, newCustomer]);

  const handleAddCustomer = useCallback(() => {
    setEditingCustomer(null);
    setAddCustomer(true);
  }, []);
  const handleEditCustomer = useCallback((customer: ICustomer) => () => {
    setEditingCustomer(customer);
    setAddCustomer(true);
  }, []);

  const handleSubmitCustomer = useCallback((customer: ICustomer) => {
    if (!editingCustomer) {
      insertCustomer(customer);
    } else {
      updateCustomer(customer);
    }
    setAddCustomer(false);
  }, [editingCustomer]);

  const handleCancelCustomer = useCallback(() => setAddCustomer(false), []);

  const memoPaperFooter = useMemo(() =>
    <div>
      <Button
        startIcon={<AddCircleRoundedIcon />}
        onClick={handleAddCustomer}
      >Создать клиента</Button>
    </div>,
  []);

  const memoCustomerUpsert = useMemo(() =>
    <CustomerEdit
      open={addCustomer}
      deleteable={false}
      customer={editingCustomer}
      onCancelClick={handleCancelCustomer}
      onSubmit={handleSubmitCustomer}
    />, [addCustomer, editingCustomer]);

  // const filterOptions = (options, { inputValue }) => {
  //   return options.filter((option) => {
  //     const fullName = ${option.firstName} ${option.lastName}.toLowerCase();
  //     const searchValue = inputValue.toLowerCase();

  //     // Фильтрация по фамилии или имени
  //     return fullName.includes(searchValue);
  //   });
  // };

  // (option, { inputValue }) => option.filter(o => o.DEAL?.USR$NAME?.toUpperCase().includes(inputValue.toUpperCase()) || o.DEAL?.CONTACT?.NAME?.toUpperCase().includes(inputValue.toUpperCase())

  // const filterOptions = (options: ICustomer[], { inputValue }: FilterOptionsState<ICustomer>) => {
  //   const search = inputValue.toLowerCase() ?? '';
  //   console.log('filterOptions', inputValue, search, search === '');
  //   if (search === '') {
  //     return options;
  //   };
  //   const filteredOptions = options.filter(customer => customer.NAME.toLowerCase().includes(search) || customer.TAXID?.toLowerCase().includes(search)) ?? [];
  //   return filteredOptions;
  // };

  const filterOptions = createFilterOptions({
    matchFrom: 'any',
    limit: 50,
    ignoreCase: true,
    stringify: (option: ICustomer) => `${option.NAME} ${option.TAXID}`,
    // stringify: (option: ICustomer) => {
    //   console.log('filterOptions', option['NAME'], option);
    //   return [option['NAME'], option['TAXID']];
    //   // return option['NAME'] ? option['NAME'] : ''
    // },
  });

  const [valueFocus, setValueFocus] = useState<boolean>(false);

  const changeFocus = (value:boolean) => () => {
    setValueFocus(value)
  }

  const [valueEnter, setValueEnter] = useState<boolean>(false);

  const changeEnter = (value:boolean) => () => {
    setValueEnter(value)
  }

  return (
    <>
      <Autocomplete
        fullWidth
        PaperComponent={CustomPaperComponent({ footer: memoPaperFooter })}
        getOptionLabel={useCallback((option: ICustomer) => option.NAME, [])}
        filterOptions={filterOptions}
        loading={customersIsFetching || insertCustomerIsLoading}
        {...(insertCustomerIsLoading
          ? {
            options: [],
            value: null
          }
          : {
            options: customers,
            value: customers?.find(el => el.ID === formik.values.DEAL?.CONTACT?.ID) || null
          })
        }
        loadingText="Загрузка данных..."
        onChange={(event, value) => {
          formik.setFieldValue('DEAL.CONTACT', value);
        }}
        onFocus={changeFocus(true)}
        onBlur={changeFocus(false)}
        onMouseEnter={changeEnter(true)}
        onMouseLeave={changeEnter(false)}
        renderOption={useCallback((props: HTMLAttributes<HTMLLIElement>, option: ICustomer) => {
          return (
            <li
              {...props}
              key={option.ID}
              style={{ display: 'flex' }}
            >
              <Box flex={1}>
                <div style={{ flex: 1, display: 'flex' }}>
                  <div style={{ flex: 1 }}>
                    {option.NAME}
                  </div>
                  <IconButton size="small" onClick={handleEditCustomer(option)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </div>
                {option.TAXID
                  ? <Typography variant="caption">{`УНП: ${option.TAXID}`}</Typography>
                  : <></>}
              </Box>
            </li>
          );
        }, [])}
        renderInput={useCallback((params) => (
          <TextField
            {...params}
            label="Клиент"
            placeholder={`${insertCustomerIsLoading ? 'Создание...' : 'Выберите клиента'}`}
            required
            name="DEAL.CONTACT"
            error={getIn(formik.touched, 'DEAL.CONTACT') && Boolean(getIn(formik.errors, 'DEAL.CONTACT'))}
            helperText={getIn(formik.touched, 'DEAL.CONTACT') && getIn(formik.errors, 'DEAL.CONTACT')}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
              <>
              {((valueFocus || valueEnter) && formik.values.DEAL?.CONTACT)
              && <IconButton title='Изменить' size='small' onClick={handleEditCustomer(formik.values.DEAL?.CONTACT)}><EditIcon/></IconButton>}
              {params.InputProps.endAdornment}
              </>)
            }}
          />
        ), [valueFocus,valueEnter,formik.values.DEAL?.CONTACT])}
      />
      {memoCustomerUpsert}
    </>
  );
}
