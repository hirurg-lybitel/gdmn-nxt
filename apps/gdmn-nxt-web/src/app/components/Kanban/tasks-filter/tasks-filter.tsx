import { Autocomplete, Box, Button, CardActions, CardContent, Checkbox, DialogActions, DialogContent, FormControlLabel, Stack, TextField, Typography } from '@mui/material';
import CustomizedCard from '../../Styled/customized-card/customized-card';
import CustomizedDialog from '../../Styled/customized-dialog/customized-dialog';
import styles from './tasks-filter.module.less';
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useGetEmployeesQuery } from '../../../features/contact/contactApi';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import filterOptions from '@gdmn-nxt/helpers/filter-options';
import { CustomerSelect } from '../../selectors/customer-select/customer-select';
import { EmployeesSelect } from '@gdmn-nxt/components/selectors/employees-select/employees-select';
import FilterDialog from '@gdmn-nxt/components/filter-dialog/filter-dialog';

export interface IFilteringData {
  [name: string]: any;
}

export interface TasksFilterProps {
  open: boolean;
  width?: string;
  filteringData: IFilteringData;
  onClose?: (event?: object) => void;
  onFilteringDataChange: (newFilteringData: IFilteringData) => void;
  onFilterClear: () => void;
}

export function TasksFilter(props: TasksFilterProps) {
  const {
    open,
    width = '400px',
    onClose,
    filteringData,
    onFilteringDataChange,
    onFilterClear
  } = props;

  const { data: employees = [], isFetching: employeesIsFetching } = useGetEmployeesQuery();
  const [taskNumber, setTaskNumber] = useState<string>(filteringData?.taskNumber);

  const handleOnChange = (entity: string, value: any) => {
    const newObject = { ...filteringData };
    delete newObject[entity];
    onFilteringDataChange({ ...newObject, ...(value?.toString().length > 0 && !!value ? { [entity]: value } : {}) });
  };

  useEffect(() => {
    setTaskNumber(filteringData?.taskNumber || '');
  }, [filteringData?.taskNumber]);

  /** Debouncing enter deal number */
  useEffect(() => {
    if (!open) return;

    const sendRequestNumber = setTimeout(() => {
      handleOnChange('taskNumber', taskNumber);
    }, 2000);

    return () => clearTimeout(sendRequestNumber);
  }, [taskNumber]);

  const taskNumberChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setTaskNumber(e.target.value), []);

  return (
    <FilterDialog
      open={open}
      onClear={() => {
        onFilterClear();
        setTaskNumber('');
        onClose && onClose();
      }}
      onClose={onClose}
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
              label="Номер задачи"
              value={taskNumber || ''}
              onChange={taskNumberChange}
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
            <EmployeesSelect
              value={filteringData?.performers}
              onChange={(value) => handleOnChange('performers', value)}
              multiple
              limitTags={2}
              label={'Исполнитель'}
              placeholder={'Выберите исполнителя'}
            />
            <CustomerSelect
              label="Клиенты"
              placeholder="Выберите клиента"
              multiple
              disableCreation
              onChange={(value) => handleOnChange('customers', value)}
              value={filteringData?.customers ? filteringData.customers : []}
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
                  checked={filteringData?.isCreator ?? false}
                  onChange={(e) => handleOnChange('isCreator', e.target.checked)}
                />
              }
              label="Я постановщик"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={filteringData?.isPerformer ?? false}
                  onChange={(e) => handleOnChange('isPerformer', e.target.checked)}
                />
              }
              label="Я исполнитель"
            />

          </Stack>
        </Box>
      </Stack>
    </FilterDialog>
  );
}

export default TasksFilter;
