import { Box, Button, Checkbox, DialogActions, DialogContent, DialogTitle, FormControlLabel, Stack, TextField, Typography } from '@mui/material';
import CustomizedDialog from '../../Styled/customized-dialog/customized-dialog';
import styles from './deals-filter.module.less';
import { useEffect, useState } from 'react';
import { DepartmentsSelect } from '@gdmn-nxt/components/selectors/departments-select/departments-select';
import { CustomerSelect } from '../../selectors/customer-select/customer-select';
import { EmployeesSelect } from '@gdmn-nxt/components/selectors/employees-select/employees-select';
import FilterDialog from '@gdmn-nxt/components/filter-dialog/filter-dialog';

export interface IFilteringData {
  [name: string]: any;
}

export interface DealsFilterProps {
  open: boolean;
  width?: string;
  onClose?: (event?: object) => void;
  filteringData: IFilteringData;
  onFilteringDataChange: (arg: IFilteringData) => void;
  onFilterClear: () => void;
}

export function DealsFilter(props: Readonly<DealsFilterProps>) {
  const {
    open,
    width = '400px',
    onClose,
    filteringData,
    onFilteringDataChange,
    onFilterClear
  } = props;

  const handleOnChange = (entity: string, value: any) => {
    const newObject = { ...filteringData };
    delete newObject[entity];
    onFilteringDataChange({ ...newObject, ...(value?.toString().length > 0 && !!value ? { [entity]: value } : {}) });
  };

  const [dealNumber, setDealNumber] = useState<string>(filteringData?.dealNumber);
  const [requestNumber, setRequestNumber] = useState<string>(filteringData?.requestNumber);

  useEffect(() => {
    setDealNumber(filteringData?.dealNumber || '');
  }, [filteringData?.dealNumber]);

  /** Debouncing enter deal number */
  useEffect(() => {
    if (!open) return;

    const sendRequestNumber = setTimeout(() => {
      handleOnChange('dealNumber', dealNumber);
    }, 2000);

    return () => clearTimeout(sendRequestNumber);
  }, [dealNumber]);

  useEffect(() => {
    setRequestNumber(filteringData?.requestNumber || '');
  }, [filteringData?.requestNumber]);

  /** Debouncing enter request number */
  useEffect(() => {
    if (!open) return;

    const sendRequestNumber = setTimeout(() => {
      handleOnChange('requestNumber', requestNumber);
    }, 2000);

    return () => clearTimeout(sendRequestNumber);
  }, [requestNumber]);

  return (
    <FilterDialog
      open={open}
      onClose={onClose}
      onClear={() => {
        onFilterClear();
        setDealNumber('');
        onClose && onClose();
      }}
      width={width}
    >
      <Stack spacing={5}>
        <Box>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            fontWeight={600}
            mb={2}
          >
              Основная информация
          </Typography>
          <Stack spacing={2}>
            <TextField
              fullWidth
              size="small"
              label="Номер заявки"
              value={requestNumber || ''}
              onChange={(e) => setRequestNumber(e.target.value)}
            />
            <TextField
              fullWidth
              size="small"
              label="Номер сделки"
              value={dealNumber || ''}
              onChange={(e) => /^\d*$/.test(e.target.value) && setDealNumber(e.target.value)}
            />
          </Stack>
        </Box>

        <Box>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            fontWeight={600}
            mb={2}
          >
              Фильтры
          </Typography>
          <Stack spacing={2}>
            <CustomerSelect
              multiple
              limitTags={2}
              value={filteringData?.customers ?? []}
              onChange={(value) => handleOnChange('customers', value)}
            />
            <DepartmentsSelect
              multiple
              limitTags={2}
              value={filteringData?.departments}
              onChange={(value) => handleOnChange('departments', value)}
              label="Подразделение"
              placeholder="Выберите Подразделение"
            />
            <EmployeesSelect
              value={filteringData?.performers}
              onChange={(value) => handleOnChange('performers', value)}
              multiple
              limitTags={2}
              label={'Исполнитель'}
              placeholder={'Выберите исполнителя'}
            />
          </Stack>
        </Box>

        <Box>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            fontFamily={'600'}
            mb={1}
          >
              Дополнительно
          </Typography>
          <Stack>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={filteringData?.isCreator ?? false}
                  onChange={(e) => handleOnChange('isCreator', e.target.checked)}
                />
              }
              label={
                <Typography variant="body2">
                    Я постановщик
                </Typography>
              }
            />
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={filteringData?.isPerformer ?? false}
                  onChange={(e) => handleOnChange('isPerformer', e.target.checked)}
                />
              }
              label={
                <Typography variant="body2">
                    Я исполнитель
                </Typography>
              }
            />
          </Stack>
        </Box>
      </Stack>
    </FilterDialog>
  );
}

export default DealsFilter;
