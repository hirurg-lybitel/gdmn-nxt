import { ICustomer, IFilteringData, IProjectType } from '@gsbelarus/util-api-types';
import { useCallback } from 'react';
import { Autocomplete, Box, Button, Stack, TextField } from '@mui/material';
import { CustomerSelect } from '@gdmn-nxt/components/selectors/customer-select/customer-select';
import { ProjectTypeSelect } from '@gdmn-nxt/components/selectors/projectType-select/projectType-select';
import { IStatusFilter, statusItems } from '../../constants';

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

  const handleChangeProjectStatus = useCallback((e: any, value: IStatusFilter) => {
    const data = { ...filteringData };

    if (value?.value === undefined) {
      delete data['status'];
    } else {
      data['status'] = value.value;
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

  const handleChangeProjectType = useCallback((value: IProjectType | null) => {
    const data = { ...filteringData };

    data['projectType'] = [value];

    onFilteringDataChange(data);
  }, [filteringData, onFilteringDataChange]);

  return (
    <Stack
      direction="row"
      spacing={2}
      flex={1}
    >
      <Autocomplete
        options={statusItems}
        size="small"
        sx={{ width: 150 }}
        disableClearable
        getOptionLabel={option => option.name}
        value={statusItems.find(item => item.value === filteringData?.status) ?? statusItems[0]}
        onChange={handleChangeProjectStatus}
        renderOption={(props, option, { selected }) => (
          <li {...props} key={option.id}>
            {option.name}
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            size="small"
            placeholder="Статус"
          />
        )}
      />
      <ProjectTypeSelect
        style={{ width: 250 }}
        withCreate
        withEdit
        value={filteringData?.projectType ? filteringData?.projectType[0] : null}
        onChange={handleChangeProjectType}
      />
      <CustomerSelect
        sx={{ width: 370 }}
        multiple
        disableCloseOnSelect
        value={filteringData?.customers ?? []}
        onChange={handleCustomerChange}
      />
      <Box alignContent="center">
        <Button
          variant="outlined"
          onClick={() => {
            filterClear();
            onClose();
          }}
        >
            Очистить
        </Button>
      </Box>
    </Stack>
  );
};
