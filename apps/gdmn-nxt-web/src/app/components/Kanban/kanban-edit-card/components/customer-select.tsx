import { ICustomer } from '@gsbelarus/util-api-types';
import { Autocomplete, AutocompleteRenderOptionState, Box, Button, Checkbox, IconButton, ListItem, TextField, TextFieldProps, Typography, createFilterOptions } from '@mui/material';
import CustomerEdit from 'apps/gdmn-nxt-web/src/app/customers/customer-edit/customer-edit';
import { customerApi, useAddCustomerMutation, useGetCustomersQuery, useUpdateCustomerMutation } from 'apps/gdmn-nxt-web/src/app/features/customer/customerApi_new';
import { HTMLAttributes, MouseEvent, useCallback, useEffect, useMemo, useState } from 'react';
import CustomPaperComponent from '../../../helpers/custom-paper-component/custom-paper-component';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import EditIcon from '@mui/icons-material/Edit';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { makeStyles } from '@mui/styles';
import SwitchStar from '@gdmn-nxt/components/switch-star/switch-star';
import { GroupHeader, GroupItems } from './group';
import ItemButtonEdit from '@gdmn-nxt/components/item-button-edit/item-button-edit';

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

type Value<Multiple> = (Multiple extends true ? Array<ICustomer> : ICustomer) | null;

interface CustomerSelectProps<Multiple extends boolean | undefined> extends BaseTextFieldProps {
  value?: Value<Multiple>;
  onChange?: (value: Value<Multiple> | undefined | null) => void;
  multiple?: Multiple;
  disableCreation?: boolean;
  disableEdition?: boolean;
  disableCaption?: boolean;
  disableFavorite?: boolean;
};

export function CustomerSelect<Multiple extends boolean | undefined = false>(props: CustomerSelectProps<Multiple>) {
  const {
    value,
    onChange,
    multiple = false,
    disableCreation = false,
    disableEdition = false,
    disableCaption = false,
    disableFavorite = true,
    style,
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

  const [addFavorite] = customerApi.useAddFavoriteMutation();
  const [deleteFavorite] = customerApi.useDeleteFavoriteMutation();

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

  const handleEditCustomer = useCallback((customer: ICustomer | undefined) => (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

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
      {disableCreation
        ? <></>
        : <Button
          startIcon={<AddCircleRoundedIcon />}
          onClick={handleAddCustomer}
        >
          Создать клиента
        </Button>}
    </div>,
  [disableCreation]);

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

  const handleFavoriteClick = useCallback((customer: ICustomer) => (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    customer.isFavorite
      ? deleteFavorite(customer.ID)
      : addFavorite(customer.ID);
  }, []);

  return (
    <>
      <Autocomplete
        className={classes.root}
        style={style}
        fullWidth
        multiple={multiple}
        limitTags={2}
        PaperComponent={CustomPaperComponent({ footer: memoPaperFooter })}
        getOptionLabel={useCallback((option: ICustomer) => option.NAME, [])}
        filterOptions={filterOptions}
        {
          ...(!disableFavorite && {
            groupBy: (option: ICustomer) => (option.isFavorite ? 'Избранные' : 'Остальные')
          })
        }
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
            <ListItem
              {...props}
              key={option.ID}
              disablePadding
              sx={{
                py: '2px !important',
                '&:hover .action': {
                  display: 'block !important',
                }
              }}
            >
              {multiple &&
                <Checkbox
                  icon={<CheckBoxOutlineBlankIcon />}
                  checkedIcon={<CheckBoxIcon />}
                  style={{ marginRight: 8 }}
                  checked={selected}
                />}
              <Box flex={1}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
                    {option.NAME}
                    {!disableCaption && option.TAXID
                      ? <Typography variant="caption">{`УНП: ${option.TAXID}`}</Typography>
                      : <></>}
                  </div>
                  {!disableEdition &&
                    <div
                      className="action"
                      style={{
                        display: 'none',
                      }}
                    >
                      <ItemButtonEdit
                        color="primary"
                        onClick={handleEditCustomer(option)}
                      />
                    </div>
                  }
                  {!disableFavorite &&
                    <SwitchStar selected={!!option.isFavorite} onClick={handleFavoriteClick(option)} />}
                </div>

              </Box>
            </ListItem>
          );
        }, [disableCaption, disableEdition, handleEditCustomer, multiple, disableFavorite])}
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
                  {(value && (!Array.isArray(value))) && !disableEdition &&
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
        ), [insertCustomerIsLoading, rest, value, disableEdition, handleEditCustomer, customers])}
        renderGroup={(params) => (
          <li key={params.key}>
            <GroupHeader>
              <Typography variant="subtitle1">{params.group}</Typography>
            </GroupHeader>
            <GroupItems>{params.children}</GroupItems>
          </li>
        )}
      />
      {memoCustomerUpsert}
    </>
  );
}
