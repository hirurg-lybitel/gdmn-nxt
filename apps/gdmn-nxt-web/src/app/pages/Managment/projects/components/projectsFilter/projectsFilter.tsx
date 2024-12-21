import { ICustomer, IFilteringData, IProjectFilter } from '@gsbelarus/util-api-types';
import { useCallback, useState } from 'react';
import CustomizedDialog from '@gdmn-nxt/components/Styled/customized-dialog/customized-dialog';
import { Autocomplete, Button, CardActions, CardContent, Stack, TextField } from '@mui/material';
import { CustomerSelect } from '@gdmn-nxt/components/selectors/customer-select/customer-select';
import { DateRange } from '@mui/lab';
import dayjs from '@gdmn-nxt/dayjs';
import { useGetFiltersQuery } from 'apps/gdmn-nxt-web/src/app/features/time-tracking';

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
    onFilteringDataChange({ ...filteringData, type: [value] });
  };

  const handleCustomerChange = (value: ICustomer | undefined | null) => {
    onFilteringDataChange({ ...filteringData, customer: value });
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
            options={projectTypeFilters}
            disableClearable
            getOptionLabel={option => option.NAME}
            isOptionEqualToValue={(option, value) => option.ID === value.ID}
            value={filteringData?.type?.length > 0 ? filteringData.type[0] : null}
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
          <CustomerSelect value={filteringData?.customer} onChange={handleCustomerChange} />
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
