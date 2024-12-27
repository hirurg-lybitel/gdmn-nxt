import { ICustomer, IFilteringData, IProjectFilter } from '@gsbelarus/util-api-types';
import { useCallback } from 'react';
import CustomizedDialog from '@gdmn-nxt/components/Styled/customized-dialog/customized-dialog';
import { Autocomplete, Button, CardActions, CardContent, Stack, TextField } from '@mui/material';
import { CustomerSelect } from '@gdmn-nxt/components/selectors/customer-select/customer-select';
import { useGetFiltersQuery } from 'apps/gdmn-nxt-web/src/app/features/time-tracking';
import { useGetCustomersQuery } from 'apps/gdmn-nxt-web/src/app/features/customer/customerApi_new';

export interface IProjectsFilterProps {
  open: boolean;
  filteringData: IFilteringData;
  onClose: () => void;
  onFilteringDataChange: (arg: IFilteringData) => void;
  onClear: () => void
}

export function ProjectsFilter({
  open,
  filteringData,
  onClose,
  onFilteringDataChange,
  onClear
}: IProjectsFilterProps) {
  const filterClear = useCallback(() => {
    onClear();
  }, [onClear]);

  const { data: projectTypeFilters = [] } = useGetFiltersQuery();

  const handleChangeProjectType = (e: any, value: IProjectFilter) => {
    const data = { ...filteringData };
    if (!value) {
      delete data['type'];
    } else {
      data['type'] = value?.CODE;
    }
    onFilteringDataChange(data);
  };

  const handleCustomerChange = (value: ICustomer | undefined | null) => {
    const data = { ...filteringData };
    if (!value) {
      delete data['customer'];
    } else {
      data['customer'] = value?.ID;
    }
    onFilteringDataChange(data);
  };

  const { data: customersResponse } = useGetCustomersQuery({
  });

  return (
    <CustomizedDialog
      open={open}
      onClose={onClose}
      width={400}
    >
      <CardContent style={{ flex: 1 }}>
        <Stack spacing={2}>
          <Autocomplete
            options={projectTypeFilters}
            disableClearable
            getOptionLabel={option => option.NAME}
            isOptionEqualToValue={(option, value) => option.ID === value.ID}
            value={projectTypeFilters.find(type => type.CODE === filteringData?.type)}
            onChange={handleChangeProjectType}
            renderOption={(props, option, { selected }) => (
              <li {...props} key={option.ID}>
                {option.NAME}
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
          <CustomerSelect value={customersResponse?.data.find(cus => cus.ID === filteringData?.customer)} onChange={handleCustomerChange} />
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
