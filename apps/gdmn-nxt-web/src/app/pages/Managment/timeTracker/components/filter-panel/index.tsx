import CustomizedDialog from '@gdmn-nxt/components/Styled/customized-dialog/customized-dialog';
import styles from './filter-panel.module.less';
import { ICustomer, IFilteringData, IUser } from '@gsbelarus/util-api-types';
import { Button, CardActions, CardContent, Checkbox, FormControlLabel, Stack } from '@mui/material';
import { CustomerSelect } from '@gdmn-nxt/components/selectors/customer-select/customer-select';
import { useCallback } from 'react';
import UserSelect from '@gdmn-nxt/components/selectors/user-select';
import usePermissions from '@gdmn-nxt/helpers/hooks/usePermissions';

export interface FilterPanelProps {
  open: boolean;
  filteringData: IFilteringData;
  onClose: () => void;
  onFilteringDataChange: (arg: IFilteringData) => void;
  onClear: () => void
}

export function FilterPanel({
  open,
  filteringData,
  onClose,
  onClear,
  onFilteringDataChange
}: FilterPanelProps) {
  const handleOnChange = (entities: string[], values: any[]) => {
    const newObject = { ...filteringData };

    const newEntities = {};
    entities.forEach((entity, idx) => {
      delete newObject[entity];
      const newValue = (() => {
        if (typeof values[idx] === 'boolean' && !values[idx]) {
          return {};
        }
        if (values[idx]?.toString().length > 0) {
          return { [entity]: values[idx] };
        }
        return {};
      })();

      Object.assign(newEntities, newValue);
    });

    onFilteringDataChange({ ...newObject, ...newEntities });
  };

  const filterClear = useCallback(() => {
    onClear();
  }, [onClear]);

  const userPermissions = usePermissions();

  return (
    <CustomizedDialog
      open={open}
      onClose={onClose}
      width={400}
    >
      <CardContent style={{ flex: 1 }}>
        <Stack spacing={2}>
          <CustomerSelect
            label="Клиенты"
            placeholder="Выберите клиента"
            multiple
            disableCloseOnSelect
            limitTags={-1}
            value={filteringData?.customers as ICustomer[] ?? []}
            onChange={(value) => handleOnChange(['customers'], [value])}
          />
          {/* {userPermissions?.['time-tracking']?.ALL && */}
          <UserSelect
            multiple
            disableCloseOnSelect
            selectAllButton
            // open
            value={filteringData?.employees as IUser[] ?? []}
            allSelected={filteringData?.allEmployees ?? false}
            onChange={(e, value, allSelected) => handleOnChange(['employees', 'allEmployees'], [value, allSelected])}
          />
          {/* } */}
          <FormControlLabel
            control={
              <Checkbox
                checked={filteringData?.billableOnly ?? false}
                onChange={(e) => handleOnChange(['billableOnly'], [e.target.checked])}
              />
            }
            label="Только оплачиваемые"
          />
        </Stack>
      </CardContent>
      <CardActions style={{ padding: '16px' }}>
        <Button
          variant="outlined"
          fullWidth
          onClick={() => onClose()}
        >
          Закрыть
        </Button>
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
}

export default FilterPanel;
