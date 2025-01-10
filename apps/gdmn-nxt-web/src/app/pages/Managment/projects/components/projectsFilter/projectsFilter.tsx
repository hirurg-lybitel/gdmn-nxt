import { ICustomer, IFilteringData, IWithID } from '@gsbelarus/util-api-types';
import { useCallback } from 'react';
import CustomizedDialog from '@gdmn-nxt/components/Styled/customized-dialog/customized-dialog';
import { Autocomplete, Button, CardActions, CardContent, Stack, TextField } from '@mui/material';
import { CustomerSelect } from '@gdmn-nxt/components/selectors/customer-select/customer-select';

export interface IProjectFilter extends IWithID {
  code: number;
  name: string;
  value?: boolean | string
}

const isDoneSelectItems: IProjectFilter[] = [
  {
    ID: 0,
    code: 0,
    name: 'Все',
    value: 'all'
  },
  {
    ID: 1,
    code: 1,
    name: 'Активные',
    value: false
  },
  {
    ID: 2,
    code: 2,
    name: 'Закрытые',
    value: true
  }
];

export interface IProjectsFilterProps {
  open: boolean;
  filteringData: IFilteringData;
  onClose: () => void;
  onFilteringDataChange: (arg: IFilteringData) => void;
  onClear: () => void,
}

export function ProjectsFilter({
  open,
  filteringData,
  onClose,
  onFilteringDataChange,
  onClear,
}: Readonly<IProjectsFilterProps>) {
  const filterClear = useCallback(() => {
    onClear();
  }, [onClear]);

  const handleChangeProjectType = useCallback((e: any, value: IProjectFilter) => {
    const data = { ...filteringData };

    if (value?.value === undefined) {
      delete data['isDone'];
    } else {
      data['isDone'] = value.value;
    }

    onFilteringDataChange(data);
  }, [filteringData, onFilteringDataChange]);

  const handleCustomerChange = (customers: ICustomer[] | undefined | null) => {
    const data = { ...filteringData };

    if (!customers || customers.length < 1) {
      delete data['customers'];
    } else {
      data['customers'] = customers;
    }

    onFilteringDataChange(data);
  };

  return (
    <CustomizedDialog
      open={open}
      onClose={onClose}
      width={400}
    >
      <CardContent style={{ flex: 1 }}>
        <Stack spacing={2}>
          <Autocomplete
            options={isDoneSelectItems}
            disableClearable
            getOptionLabel={option => option.name}
            isOptionEqualToValue={(option, value) => option?.ID === value?.ID}
            value={isDoneSelectItems.find(item => item.value === filteringData?.isDone)}
            onChange={handleChangeProjectType}
            renderOption={(props, option, { selected }) => (
              <li {...props} key={option.ID}>
                {option.name}
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                placeholder="Фильтр по типу"
              />
            )}
          />
          <CustomerSelect
            multiple
            disableCloseOnSelect
            value={filteringData?.customers ?? []}
            onChange={handleCustomerChange}
          />
        </Stack>
      </CardContent>
      <CardActions style={{ padding: '16px' }}>
        <Button
          variant="contained"
          fullWidth
          onClick={() => {
            filterClear();
            onClose();
          }}
        >
            Очистить
        </Button>
      </CardActions>
    </CustomizedDialog>
  );
};
