import { createFilterOptions } from '@mui/material';

const filterOptions = (limit = 50, fieldName = '') => createFilterOptions({
  matchFrom: 'any',
  limit,
  stringify: (option: any) => option[fieldName],
});

export default filterOptions;
