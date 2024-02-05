import TagIcon from '@mui/icons-material/Tag';
import CustomizedDialog from '@gdmn-nxt/components/Styled/customized-dialog/customized-dialog';
import styles from './contacts-filter.module.less';
import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import { Button, CardActions, CardContent, Checkbox, FormControlLabel, InputAdornment, Stack } from '@mui/material';
import { LabelsSelect } from '@gdmn-nxt/components/Labels/labels-select';
import { IContactPerson, ICustomer, IFilteringData, ILabel } from '@gsbelarus/util-api-types';
import { useDispatch } from 'react-redux';
import { clearFilterData } from '../../../store/filtersSlice';
import { useCallback, useState } from 'react';
import { CustomerSelect } from '@gdmn-nxt/components/Kanban/kanban-edit-card/components/customer-select';
import { ContactSelect } from '../contact-select';

export interface ContactsFilterProps {
  open: boolean;
  onClose: () => void;
  filteringData: IFilteringData;
  onFilteringDataChange: (arg: IFilteringData) => void;
}

export function ContactsFilter({
  open,
  onClose,
  filteringData,
  onFilteringDataChange
}: ContactsFilterProps) {
  const dispatch = useDispatch();
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
    dispatch(clearFilterData('contacts'));
  }, []);

  return (
    <CustomizedDialog
      open={open}
      onClose={onClose}
      width={400}
    >
      <CardContent style={{ flex: 1 }}>
        <Stack spacing={2}>
          <FormControlLabel
            control={
              <Checkbox
                checked={filteringData?.isFavorite ?? false}
                onChange={(e) => handleOnChange('isFavorite', e.target.checked)}
              />
            }
            label="Только избранные"
          />
          <CustomerSelect
            label="Компании"
            placeholder="Выберите компанию"
            multiple
            value={filteringData?.COMPANY as ICustomer[] ?? []}
            onChange={(value) => handleOnChange('COMPANY', value)}
          />
          <ContactSelect
            label="Ответственный"
            placeholder="Выберите ответственного"
            limitTags={2}
            value={filteringData?.RESPONDENTS as IContactPerson[] ?? []}
            onChange={(value) => handleOnChange('RESPONDENTS', value)}
          />
          <LabelsSelect
            onChange={(value) => handleOnChange('LABELS', value)}
            labels={filteringData?.LABELS as ILabel[] ?? []}
            InputProps={{
              startAdornment: (
                <InputAdornment position="end">
                  <TagIcon />
                </InputAdornment>
              ),
            }}
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

export default ContactsFilter;
