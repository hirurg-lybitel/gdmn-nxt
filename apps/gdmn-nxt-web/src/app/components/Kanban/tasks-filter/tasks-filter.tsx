import { Autocomplete, Button, CardActions, CardContent, Stack, TextField } from '@mui/material';
import CustomizedCard from '../../Styled/customized-card/customized-card';
import CustomizedDialog from '../../Styled/customized-dialog/customized-dialog';
import styles from './tasks-filter.module.less';
import { useEffect, useState } from 'react';

export interface IFilteringData {
  [name: string] : any;
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

  const [taskNumber, setTaskNumber] = useState<string>(filteringData?.taskNumber);

  const handleOnChange = (entity: string, value: any) => {
    const newObject = { ...filteringData };
    delete newObject[entity];
    onFilteringDataChange({ ...newObject, ...(value?.length > 0 ? { [entity]: value } : {}) });
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
          <Stack spacing={3}>
            <TextField
              label="Номер задачи"
              value={taskNumber || ''}
              onChange={(e) => setTaskNumber(e.target.value)}
            />
          </Stack>
        </CardContent>
        <CardActions style={{
          padding: '16px'
        }}>
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
