import { Autocomplete, Button, CardActions, CardContent, Checkbox, FormControlLabel, Stack, TextField } from '@mui/material';
import CustomizedCard from '../../Styled/customized-card/customized-card';
import CustomizedDialog from '../../Styled/customized-dialog/customized-dialog';
import styles from './tasks-filter.module.less';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { useGetEmployeesQuery } from '../../../features/contact/contactApi';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import filterOptions from '../../helpers/filter-options';

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
    onFilteringDataChange({ ...newObject, ...(value?.toString().length > 0 ? { [entity]: value } : {}) });
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
            <Autocomplete
              options={employees}
              value={
                employees?.filter(employee => filteringData && (filteringData.performers)?.find((el: any) => el.ID === employee.ID))
              }
              onChange={(e, value) => handleOnChange('performers', value)}
              multiple
              limitTags={2}
              getOptionLabel={option => option.NAME}
              filterOptions={filterOptions(50, 'NAME')}
              renderOption={(props, option, { selected }) => (
                <li {...props} key={option.ID}>
                  <Checkbox
                    icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                    checkedIcon={<CheckBoxIcon fontSize="small" />}
                    style={{ marginRight: 8 }}
                    checked={selected}
                  />
                  {option.NAME}
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Исполнитель"
                  placeholder="Выберите исполнителей"
                />
              )}
              loading={employeesIsFetching}
              loadingText="Загрузка данных..."
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
