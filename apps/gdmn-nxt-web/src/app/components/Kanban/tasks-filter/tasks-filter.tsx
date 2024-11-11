import { Autocomplete, Button, CardActions, CardContent, Checkbox, FormControlLabel, Stack, TextField } from '@mui/material';
import CustomizedCard from '../../Styled/customized-card/customized-card';
import CustomizedDialog from '../../Styled/customized-dialog/customized-dialog';
import styles from './tasks-filter.module.less';
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useGetEmployeesQuery } from '../../../features/contact/contactApi';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import filterOptions from '../../helpers/filter-options';
import { CustomerSelect } from '../kanban-edit-card/components/customer-select';
import { EmployeesSelect } from '@gdmn-nxt/components/employees-select/employees-select';

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
    <CustomizedDialog
      open={open}
      onClose={onClose}
      width={width}
    >
      <CustomizedCard
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          width: width,
        }}
      >
        <CardContent style={{ flex: 1 }}>
          <Stack spacing={2}>
            <TextField
              label="Номер задачи"
              value={taskNumber || ''}
              onChange={taskNumberChange}
            />
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
        </CardContent>
        <CardActions
          style={{
            padding: '16px'
          }}
        >
          <Button
            variant="contained"
            fullWidth
            onClick={() => {
              onFilterClear();
              setTaskNumber('');
              onClose && onClose();
            }}
          >
            Очистить
          </Button>
        </CardActions>
      </CustomizedCard>
    </CustomizedDialog>
  );
}

export default TasksFilter;
