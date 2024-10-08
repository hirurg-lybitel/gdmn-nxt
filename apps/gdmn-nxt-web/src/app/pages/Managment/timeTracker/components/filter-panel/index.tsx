import CustomizedDialog from '@gdmn-nxt/components/Styled/customized-dialog/customized-dialog';
import styles from './filter-panel.module.less';
import { ICustomer, IFilteringData, IUser } from '@gsbelarus/util-api-types';
import { Button, CardActions, CardContent, Checkbox, FormControlLabel, Stack } from '@mui/material';
import { CustomerSelect } from '@gdmn-nxt/components/Kanban/kanban-edit-card/components/customer-select';
import { useCallback } from 'react';
import UserSelect from '@gdmn-nxt/components/user-select';
import usePermissions from '@gdmn-nxt/components/helpers/hooks/usePermissions';

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
  const handleOnChange = (entity: string, value: any) => {
    const newObject = { ...filteringData };
    delete newObject[entity];

    const newValue = (() => {
      if (typeof value === 'boolean' && !value) {
        return {};
      }
      if (value?.toString().length > 0) {
        return { [entity]: value };
      }
      return {};
    })();

    onFilteringDataChange({ ...newObject, ...newValue });
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
            onChange={(value) => handleOnChange('customers', value)}
          />
          {userPermissions?.timeTracking.ALL &&
            <UserSelect
              multiple
              disableCloseOnSelect
              value={filteringData?.employees as IUser[] ?? []}
              onChange={(e, value) => handleOnChange('employees', value)}
            />
          }
          <FormControlLabel
            control={
              <Checkbox
                checked={filteringData?.billableOnly ?? false}
                onChange={(e) => handleOnChange('billableOnly', e.target.checked)}
              />
            }
            label="Только оплачиваемые"
          />
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
}

export default FilterPanel;
