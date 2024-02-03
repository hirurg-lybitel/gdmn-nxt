import { IContactWithID, ICustomer, IKanbanCard } from '@gsbelarus/util-api-types';
import { Autocomplete, AutocompleteProps, AutocompleteRenderOptionState, Box, Button, Checkbox, IconButton, TextField, TextFieldProps, Typography, createFilterOptions } from '@mui/material';
import CustomerEdit from 'apps/gdmn-nxt-web/src/app/customers/customer-edit/customer-edit';
import { useAddCustomerMutation, useGetCustomersQuery, useUpdateCustomerMutation } from 'apps/gdmn-nxt-web/src/app/features/customer/customerApi_new';
import { FormikProps, getIn } from 'formik';
import { HTMLAttributes, useCallback, useEffect, useMemo, useState } from 'react';
import CustomPaperComponent from '../../../helpers/custom-paper-component/custom-paper-component';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import EditIcon from '@mui/icons-material/Edit';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(() => ({
  root: {
    '& .editIcon': {
      visibility: 'hidden',
      padding: '4px'
    },
    '&:hover .editIcon, &:focus-within .editIcon': {
      visibility: 'visible',
    }
  },
}));


type BaseTextFieldProps = Omit<
  TextFieldProps,
  'onChange'
>;

type Value<Multiple> = Multiple extends true ? Array<ICustomer> : ICustomer;

interface CustomerSelectProps<Multiple extends boolean | undefined> extends BaseTextFieldProps {
  value?: Value<Multiple>;
  onChange?: (value: Value<Multiple> | undefined | null) => void;
  multiple?: Multiple;
};

export function CustomerSelect<Multiple extends boolean | undefined = false>(props: CustomerSelectProps<Multiple>) {
  const {
    value,
    onChange,
    multiple = false,
    ...rest
  } = props;

  const classes = useStyles();

  const { data: customersResponse, isFetching: customersIsFetching } = useGetCustomersQuery();
  const customers: ICustomer[] = useMemo(
    () => [...(customersResponse?.data ?? [])],
    [customersResponse?.data]
  );

  const [insertCustomer, { isSuccess: insertCustomerIsSuccess, isLoading: insertCustomerIsLoading, data: newCustomer }] = useAddCustomerMutation();
  const [updateCustomer] = useUpdateCustomerMutation();

  const [addCustomer, setAddCustomer] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<ICustomer | null>(null);

  useEffect(() => {
    if (insertCustomerIsSuccess) {
      onChange && onChange((multiple ? [newCustomer] : newCustomer) as Value<Multiple>);
    }
  }, [insertCustomerIsSuccess, newCustomer, onChange]);

  const handleAddCustomer = useCallback(() => {
    setEditingCustomer(null);
    setAddCustomer(true);
  }, []);

  const handleEditCustomer = useCallback((customer: ICustomer | undefined) => () => {
    if (!customer) return;
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

  const handleChange = (e: any, value: ICustomer | ICustomer[] | null) => onChange && onChange(value as Value<Multiple>);

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
      onCancel={handleCancelCustomer}
      onSubmit={handleSubmitCustomer}
    />, [addCustomer, editingCustomer]);

  const filterOptions = createFilterOptions({
    matchFrom: 'any',
    limit: 50,
    ignoreCase: true,
    stringify: (option: ICustomer) => `${option.NAME} ${option.TAXID}`,
  });

  return (
    <>
      <Autocomplete
        className={classes.root}
        fullWidth
        multiple={multiple}
        limitTags={2}
        PaperComponent={CustomPaperComponent({ footer: memoPaperFooter })}
        getOptionLabel={useCallback((option: ICustomer) => option.NAME, [])}
        filterOptions={filterOptions}
        loading={customersIsFetching || insertCustomerIsLoading}
        {...(insertCustomerIsLoading
          ? {
            options: [],
            value: multiple ? [] : null
          }
          : {
            options: customers,
            value: multiple && Array.isArray(value)
              ? customers.filter(customer => value?.find(el => el.ID === customer.ID)) ?? []
              : customers?.find(el => el.ID === (value as ICustomer)?.ID) ?? null
          })
        }
        loadingText="Загрузка данных..."
        onChange={handleChange}
        renderOption={useCallback((props: HTMLAttributes<HTMLLIElement>, option: ICustomer, { selected }: AutocompleteRenderOptionState) => {
          return (
            <li
              {...props}
              key={option.ID}
              style={{ display: 'flex' }}
            >
              {multiple &&
                <Checkbox
                  icon={<CheckBoxOutlineBlankIcon />}
                  checkedIcon={<CheckBoxIcon />}
                  style={{ marginRight: 8 }}
                  checked={selected}
                />}
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
            label="Клиент"
            placeholder={`${insertCustomerIsLoading ? 'Создание...' : 'Выберите клиента'}`}
            {...params}
            {...rest}
            InputProps={{
              ...params.InputProps,
              ...rest.InputProps,
              endAdornment: (
                <>
                  {(value && (!Array.isArray(value))) &&
                    <IconButton
                      className="editIcon"
                      title="Изменить"
                      size="small"
                      onClick={handleEditCustomer(customers?.find(el => el.ID === value?.ID))}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>}
                  {params.InputProps.endAdornment}
                </>)
            }}
          />
        ), [value])}
      />
      {memoCustomerUpsert}
    </>
  );
}
