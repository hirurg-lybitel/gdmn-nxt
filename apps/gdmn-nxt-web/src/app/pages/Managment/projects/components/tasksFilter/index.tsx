import { Autocomplete, Box, Stack, TextField } from '@mui/material';
import { IStatusFilter, statusItems } from '../../constants';
import { IFilteringData } from '@gsbelarus/util-api-types';
import { useCallback } from 'react';
import SearchBar from '@gdmn-nxt/components/search-bar/search-bar';

export interface ITasksFilterProps {
  light?: boolean;
  filteringData: IFilteringData;
  onFilteringDataChange: (arg: IFilteringData) => void;
}

export default function TasksFilter({
  light = false,
  filteringData,
  onFilteringDataChange
}: Readonly<ITasksFilterProps>) {
  const handleChangeStatus = useCallback((e: any, { value }: IStatusFilter) => {
    const data = { ...filteringData };
    data['status'] = value;

    onFilteringDataChange(data);
  }, [filteringData, onFilteringDataChange]);

  const cancelSearch = useCallback(() => {
    const newObject = { ...filteringData };
    delete newObject.name;
    onFilteringDataChange(newObject);
  }, [filteringData, onFilteringDataChange]);

  const requestSearch = useCallback((value: string) => {
    const newObject = { ...filteringData };
    delete newObject.name;
    onFilteringDataChange({
      ...newObject,
      ...(value !== '' ? { name: [value] } : {})
    });
  }, [filteringData, onFilteringDataChange]);

  return (
    <Stack
      direction="row"
      spacing={2}
      flex={1}
    >
      <Autocomplete
        sx={{ width: 150, bgcolor: 'var(--color-paper-bg)' }}
        options={statusItems}
        disableClearable
        getOptionLabel={option => option.name}
        value={statusItems.find(item => item.value === filteringData?.status) ?? statusItems[1]}
        onChange={handleChangeStatus}
        renderOption={(props, option) => (
          <li {...props} key={option.id}>
            {option.name}
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
          />
        )}
      />
      {!light && (
        <Box display="flex" flex={1}>
          <SearchBar
            onCancelSearch={cancelSearch}
            onRequestSearch={requestSearch}
            fullWidth
            cancelOnEscape
            value={
              filteringData?.name
                ? filteringData.name?.[0]
                : undefined
            }
          />
        </Box>
      )}
    </Stack>
  );
}
