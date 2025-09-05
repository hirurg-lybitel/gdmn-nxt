import TagIcon from '@mui/icons-material/Tag';
import CustomizedDialog from '@gdmn-nxt/components/Styled/customized-dialog/customized-dialog';
import styles from './contacts-filter.module.less';
import { Button, CardActions, CardContent, Checkbox, FormControlLabel, InputAdornment, Stack } from '@mui/material';
import { LabelsSelect } from '@gdmn-nxt/components/selectors/labels-select';
import { IContactPerson, ICustomer, IFilteringData, ILabel } from '@gsbelarus/util-api-types';
import { CustomerSelect } from '@gdmn-nxt/components/selectors/customer-select/customer-select';
import { ContactSelect } from '../../selectors/contact-select';
import FilterDialog from '@gdmn-nxt/components/filter-dialog/filter-dialog';

export interface ContactsFilterProps {
  open: boolean;
  onClose: () => void;
  filteringData: IFilteringData;
  onFilteringDataChange: (arg: IFilteringData) => void;
  filterClear: () => void;
}

export function ContactsFilter({
  open,
  onClose,
  filteringData,
  onFilteringDataChange,
  filterClear
}: ContactsFilterProps) {
  const handleOnChange = (entity: string, value: any) => {
    const newObject = { ...filteringData };
    delete newObject[entity];

    if (entity === 'isOur' && value) {
      delete newObject['COMPANY'];
    }
    if (entity === 'COMPANY' && value?.toString().length > 0) {
      delete newObject['isOur'];
    }

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

  return (
    <FilterDialog
      open={open}
      onClose={onClose}
      onClear={filterClear}
      width={400}
    >
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
        <FormControlLabel
          control={
            <Checkbox
              checked={!!filteringData?.isOur}
              onChange={(e) => handleOnChange('isOur', e.target.checked)}
            />
          }
          label="Только наши"
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
          multiple
          value={filteringData?.RESPONDENTS as IContactPerson[] ?? []}
          onChange={(value) => handleOnChange('RESPONDENTS', value)}
        />
        <LabelsSelect
          onChange={(value) => handleOnChange('LABELS', value)}
          labels={filteringData?.LABELS as ILabel[] ?? []}
          textFieldProps={{
            InputProps: {
              startAdornment: (
                <InputAdornment position="end">
                  <TagIcon />
                </InputAdornment>
              ),
            }
          }}
        />
      </Stack>

    </FilterDialog>
  );
}

export default ContactsFilter;
