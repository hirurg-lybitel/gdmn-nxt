import { ICustomer, IKanbanCard } from '@gsbelarus/util-api-types';
import { Autocomplete, Button, IconButton, TextField } from '@mui/material';
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

  return (
    <>
      <Autocomplete
        fullWidth
        PaperComponent={CustomPaperComponent({ footer: memoPaperFooter })}
        getOptionLabel={useCallback((option: ICustomer) => option.NAME, [])}
        filterOptions={filterOptions(50, 'NAME')}
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
        renderOption={useCallback((props: HTMLAttributes<HTMLLIElement>, option: ICustomer) => {
          return (
            <li
              {...props}
              key={option.ID}
              style={{ display: 'flex' }}
            >
              <div style={{ flex: 1, display: 'flex' }}>
                <div style={{ flex: 1 }}>
                  {option.NAME}
                </div>
                <IconButton size="small" onClick={handleEditCustomer(option)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </div>
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
          />
        ), [])}
      />
      {memoCustomerUpsert}
    </>
  );
}
